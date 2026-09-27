"""Talks to Supabase Auth: verifies access tokens and creates admin accounts."""

import uuid
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from typing import Any

import httpx2
import jwt

from app.core.config import settings
from app.core.errors import ConflictError, ServiceUnavailableError
from app.modules.auth.constants import (
    ADMIN_USERS_PATH,
    ALLOWED_JWT_ALGORITHMS,
    AUTH_ISSUER_PATH,
    AUTH_USERS_PAGE_SIZE,
    GENERATE_LINK_PATH,
    JWKS_CACHE_SECONDS,
    JWKS_PATH,
    SUPABASE_REQUEST_TIMEOUT_SECONDS,
)
from app.modules.auth.enums import AuthLinkType

NOT_CONFIGURED = "Admin sign-in isn't set up yet (SUPABASE_URL is missing)"
AUTH_UNREACHABLE = "Couldn't reach the sign-in service. Try again in a moment."

# Given a token, returns the public key that should have signed it.
SigningKeyResolver = Callable[[str], Any]


class TokenVerifier:
    def __init__(self, signing_key_for: SigningKeyResolver, *, issuer: str, audience: str) -> None:
        self._signing_key_for = signing_key_for
        self._issuer = issuer
        self._audience = audience

    def verify(self, token: str) -> uuid.UUID | None:
        """Returns the Supabase user id, or None if the token is invalid or expired."""
        try:
            key = self._signing_key_for(token)
            payload = jwt.decode(
                token,
                key,
                algorithms=list(ALLOWED_JWT_ALGORITHMS),
                audience=self._audience,
                issuer=self._issuer,
                options={"require": ["sub", "exp", "aud", "iss"]},
            )
            return uuid.UUID(payload["sub"])
        except jwt.PyJWKClientConnectionError as error:
            raise ServiceUnavailableError(AUTH_UNREACHABLE) from error
        except (jwt.PyJWTError, ValueError):
            return None


def _require_supabase_url() -> str:
    if not settings.supabase_url:
        raise ServiceUnavailableError(NOT_CONFIGURED)
    return settings.supabase_url


@lru_cache
def get_token_verifier() -> TokenVerifier:
    """FastAPI dependency. Built once; the key set is cached by PyJWKClient."""
    base_url = _require_supabase_url()
    jwks = jwt.PyJWKClient(f"{base_url}{JWKS_PATH}", lifespan=JWKS_CACHE_SECONDS)
    return TokenVerifier(
        lambda token: jwks.get_signing_key_from_jwt(token).key,
        issuer=f"{base_url}{AUTH_ISSUER_PATH}",
        audience=settings.supabase_jwt_audience,
    )


@dataclass(frozen=True)
class AuthUserInfo:
    last_sign_in_at: datetime | None


@dataclass(frozen=True)
class GeneratedLink:
    auth_user_id: uuid.UUID
    action_link: str


def _parse_timestamp(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


class SupabaseAdminClient:
    """Server-side Auth admin API. Uses the secret key, so never expose it to browsers."""

    def __init__(self, base_url: str, secret_key: str, http: httpx2.Client | None = None) -> None:
        self._base_url = base_url
        # New sb_secret_ keys are not JWTs: they go in the apikey header, never Authorization.
        self._http = http or httpx2.Client(timeout=SUPABASE_REQUEST_TIMEOUT_SECONDS)
        self._headers = {"apikey": secret_key}

    def create_user(self, email: str, password: str) -> uuid.UUID:
        response = self._http.post(
            f"{self._base_url}{ADMIN_USERS_PATH}",
            headers=self._headers,
            json={"email": email, "password": password, "email_confirm": True},
        )
        if response.status_code in {httpx2.codes.CONFLICT, httpx2.codes.UNPROCESSABLE_CONTENT}:
            raise ConflictError(f"Supabase refused to create the user: {response.text}")
        response.raise_for_status()
        return uuid.UUID(response.json()["id"])

    def generate_link(self, link_type: AuthLinkType, email: str, redirect_to: str) -> GeneratedLink:
        """Creates (for invites) the user and returns a one-time link to set their password.

        Nothing is emailed: the admin shares the link themselves.
        """
        response = self._http.post(
            f"{self._base_url}{GENERATE_LINK_PATH}",
            headers=self._headers,
            json={"type": link_type.value, "email": email, "redirect_to": redirect_to},
        )
        if response.status_code in {httpx2.codes.CONFLICT, httpx2.codes.UNPROCESSABLE_CONTENT}:
            raise ConflictError(
                "That email already has a sign-in account. Ask the owner to add it another way."
            )
        response.raise_for_status()
        body = response.json()
        action_link = body.get("action_link") or body.get("properties", {}).get("action_link")
        return GeneratedLink(auth_user_id=uuid.UUID(body["id"]), action_link=action_link)

    def list_users(self) -> dict[uuid.UUID, AuthUserInfo]:
        """All Auth users in one request, keyed by id (avoids one call per admin)."""
        response = self._http.get(
            f"{self._base_url}{ADMIN_USERS_PATH}",
            headers=self._headers,
            params={"per_page": AUTH_USERS_PAGE_SIZE},
        )
        response.raise_for_status()
        return {
            uuid.UUID(user["id"]): AuthUserInfo(
                last_sign_in_at=_parse_timestamp(user.get("last_sign_in_at"))
            )
            for user in response.json().get("users", [])
        }


def get_admin_client() -> SupabaseAdminClient:
    base_url = _require_supabase_url()
    if not settings.supabase_secret_key:
        raise ServiceUnavailableError("SUPABASE_SECRET_KEY is missing")
    return SupabaseAdminClient(base_url, settings.supabase_secret_key)
