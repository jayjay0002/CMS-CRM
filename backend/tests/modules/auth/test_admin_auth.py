import json
import uuid
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx2
import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, ConflictError, PermissionDeniedError
from app.main import app
from app.modules.auth.dependencies import NO_ADMIN_ACCESS, require_owner
from app.modules.auth.enums import AdminRole
from app.modules.auth.service import create_admin
from app.modules.auth.supabase import SupabaseAdminClient, TokenVerifier, get_token_verifier
from tests.factories import make_admin

ME_URL = "/api/v1/admin/auth/me"
TEST_ISSUER = "https://test-project.supabase.co/auth/v1"
TEST_AUDIENCE = "authenticated"

# Stand-ins for Supabase's signing key pair (ES256, like real projects).
SIGNING_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


def supabase_token(auth_user_id: uuid.UUID, **overrides: Any) -> str:
    now = datetime.now(UTC)
    claims = {
        "sub": str(auth_user_id),
        "aud": TEST_AUDIENCE,
        "iss": TEST_ISSUER,
        "iat": now,
        "exp": now + timedelta(hours=1),
        "role": "authenticated",
    } | overrides
    key = claims.pop("signing_key", SIGNING_KEY)
    return jwt.encode(claims, key, algorithm="ES256")


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def fake_supabase_keys() -> Iterator[None]:
    verifier = TokenVerifier(
        lambda _token: SIGNING_KEY.public_key(), issuer=TEST_ISSUER, audience=TEST_AUDIENCE
    )
    app.dependency_overrides[get_token_verifier] = lambda: verifier
    yield
    app.dependency_overrides.pop(get_token_verifier, None)


def test_valid_supabase_token_for_an_admin_unlocks_me(client: TestClient, db: Session) -> None:
    admin = make_admin(db, email="owner@example.com", full_name="Pat Owner", role=AdminRole.OWNER)

    response = client.get(ME_URL, headers=auth_header(supabase_token(admin.auth_user_id)))

    assert response.status_code == 200
    assert response.json() == {
        "id": admin.id,
        "email": "owner@example.com",
        "full_name": "Pat Owner",
        "role": "owner",
    }


def test_me_requires_a_token(client: TestClient) -> None:
    response = client.get(ME_URL)

    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "overrides",
    [
        {"signing_key": OTHER_KEY},
        {"exp": datetime.now(UTC) - timedelta(minutes=1)},
        {"aud": "anon"},
        {"iss": "https://someone-else.supabase.co/auth/v1"},
        {"sub": "not-a-uuid"},
    ],
    ids=["wrong signature", "expired", "wrong audience", "wrong issuer", "bad subject"],
)
def test_me_rejects_bad_tokens(client: TestClient, db: Session, overrides: dict) -> None:
    admin = make_admin(db)

    token = supabase_token(admin.auth_user_id, **overrides)

    assert client.get(ME_URL, headers=auth_header(token)).status_code == 401
    assert client.get(ME_URL, headers=auth_header("not-a-jwt")).status_code == 401


def test_signed_in_user_who_is_not_an_admin_is_forbidden(client: TestClient) -> None:
    response = client.get(ME_URL, headers=auth_header(supabase_token(uuid.uuid4())))

    assert response.status_code == 403
    assert response.json() == {"detail": NO_ADMIN_ACCESS}


def test_deactivated_admin_is_forbidden(client: TestClient, db: Session) -> None:
    admin = make_admin(db, is_active=False)

    response = client.get(ME_URL, headers=auth_header(supabase_token(admin.auth_user_id)))

    assert response.status_code == 403


def test_me_is_unavailable_when_supabase_is_not_configured(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    app.dependency_overrides.pop(get_token_verifier)
    get_token_verifier.cache_clear()
    monkeypatch.setattr("app.modules.auth.supabase.settings.supabase_url", None)

    response = client.get(ME_URL, headers=auth_header("anything"))

    assert response.status_code == 503


def test_require_owner_blocks_staff(db: Session) -> None:
    owner = make_admin(db, role=AdminRole.OWNER)
    staff = make_admin(db, role=AdminRole.STAFF)

    assert require_owner(owner) is owner
    with pytest.raises(PermissionDeniedError):
        require_owner(staff)


def fake_supabase_admin(
    created_user_id: uuid.UUID, requests: list[httpx2.Request]
) -> SupabaseAdminClient:
    def respond(request: httpx2.Request) -> httpx2.Response:
        requests.append(request)
        return httpx2.Response(httpx2.codes.OK, json={"id": str(created_user_id)})

    http = httpx2.Client(transport=httpx2.MockTransport(respond))
    return SupabaseAdminClient("https://test-project.supabase.co", "sb_secret_test", http)


def test_create_admin_creates_supabase_user_and_admin_row(db: Session) -> None:
    auth_user_id = uuid.uuid4()
    requests: list[httpx2.Request] = []

    admin = create_admin(
        db,
        fake_supabase_admin(auth_user_id, requests),
        email=" New.Owner@Example.com ",
        full_name=" Sam ",
        password="a-long-enough-password",
        role=AdminRole.OWNER,
    )

    assert (admin.auth_user_id, admin.email, admin.full_name) == (
        auth_user_id,
        "new.owner@example.com",
        "Sam",
    )
    [request] = requests
    assert request.url.path == "/auth/v1/admin/users"
    assert request.headers["apikey"] == "sb_secret_test"
    assert "authorization" not in request.headers
    assert json.loads(request.content) == {
        "email": "new.owner@example.com",
        "password": "a-long-enough-password",
        "email_confirm": True,
    }


def test_create_admin_rejects_short_password_and_duplicate_email(db: Session) -> None:
    make_admin(db, email="taken@example.com")
    requests: list[httpx2.Request] = []
    supabase = fake_supabase_admin(uuid.uuid4(), requests)

    with pytest.raises(BusinessRuleError):
        create_admin(
            db,
            supabase,
            email="new@example.com",
            full_name="N",
            password="short",
            role=AdminRole.STAFF,
        )
    with pytest.raises(ConflictError):
        create_admin(
            db,
            supabase,
            email="TAKEN@example.com",
            full_name="Dup",
            password="a-long-enough-password",
            role=AdminRole.STAFF,
        )
    assert requests == []
