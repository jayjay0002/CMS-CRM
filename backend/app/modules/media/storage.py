"""Supabase Storage client (server-side, uses the secret key)."""

import httpx2

from app.core.config import settings
from app.core.errors import ServiceUnavailableError
from app.modules.media.constants import (
    IMAGE_CACHE_CONTROL_SECONDS,
    MAX_IMAGE_BYTES,
    STORAGE_BUCKET,
    STORAGE_BUCKET_PATH,
    STORAGE_OBJECT_PATH,
    STORAGE_PUBLIC_OBJECT_PATH,
    STORAGE_REQUEST_TIMEOUT_SECONDS,
)
from app.modules.media.enums import ImageFormat


class SupabaseStorage:
    def __init__(self, base_url: str, secret_key: str, http: httpx2.Client | None = None) -> None:
        self._base_url = base_url
        # New sb_secret_ keys go in the apikey header, never Authorization.
        self._headers = {"apikey": secret_key}
        self._http = http or httpx2.Client(timeout=STORAGE_REQUEST_TIMEOUT_SECONDS)

    def ensure_bucket(self) -> bool:
        """Creates the public image bucket if it's missing. Returns True if it was created."""
        existing = self._http.get(f"{self._base_url}{STORAGE_BUCKET_PATH}", headers=self._headers)
        existing.raise_for_status()
        if any(bucket["id"] == STORAGE_BUCKET for bucket in existing.json()):
            return False
        response = self._http.post(
            f"{self._base_url}{STORAGE_BUCKET_PATH}",
            headers=self._headers,
            json={
                "id": STORAGE_BUCKET,
                "name": STORAGE_BUCKET,
                "public": True,
                "file_size_limit": MAX_IMAGE_BYTES,
                "allowed_mime_types": [image_format.value for image_format in ImageFormat],
            },
        )
        response.raise_for_status()
        return True

    def upload(self, path: str, data: bytes, image_format: ImageFormat) -> str:
        """Uploads the file and returns its public URL."""
        response = self._http.post(
            f"{self._base_url}{STORAGE_OBJECT_PATH}/{STORAGE_BUCKET}/{path}",
            headers={
                **self._headers,
                "Content-Type": image_format.value,
                "Cache-Control": f"max-age={IMAGE_CACHE_CONTROL_SECONDS}",
            },
            content=data,
        )
        response.raise_for_status()
        return public_url(self._base_url, path)


def public_url_prefix(base_url: str) -> str:
    return f"{base_url}{STORAGE_PUBLIC_OBJECT_PATH}/{STORAGE_BUCKET}/"


def public_url(base_url: str, path: str) -> str:
    return f"{public_url_prefix(base_url)}{path}"


def get_storage() -> SupabaseStorage:
    """FastAPI dependency (overridden with a fake in tests)."""
    if not settings.supabase_url or not settings.supabase_secret_key:
        raise ServiceUnavailableError("Image uploads aren't set up (Supabase settings missing)")
    return SupabaseStorage(settings.supabase_url, settings.supabase_secret_key)
