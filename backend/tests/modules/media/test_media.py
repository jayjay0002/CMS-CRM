import uuid
from collections.abc import Iterator

import httpx2
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.supabase import get_token_verifier
from app.modules.media.constants import MAX_IMAGE_BYTES, STORAGE_BUCKET
from app.modules.media.enums import ImageFormat
from app.modules.media.service import UNSUPPORTED_IMAGE, detect_image_format
from app.modules.media.storage import SupabaseStorage, get_storage
from tests.factories import make_admin

UPLOAD_URL = "/api/v1/admin/media/images"
TEST_SUPABASE_URL = "https://test-project.supabase.co"

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"\x00" * 64
WEBP_BYTES = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 64


class FakeVerifier:
    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


class FakeStorageServer:
    def __init__(self) -> None:
        self.uploads: list[httpx2.Request] = []
        self.buckets: list[dict] = []

    def handle(self, request: httpx2.Request) -> httpx2.Response:
        if request.url.path.endswith("/bucket"):
            if request.method == "POST":
                self.buckets.append({"id": STORAGE_BUCKET})
            return httpx2.Response(httpx2.codes.OK, json=self.buckets)
        self.uploads.append(request)
        return httpx2.Response(httpx2.codes.OK, json={"Key": request.url.path})

    def client(self) -> SupabaseStorage:
        http = httpx2.Client(transport=httpx2.MockTransport(self.handle))
        return SupabaseStorage(TEST_SUPABASE_URL, "sb_secret_test", http)


@pytest.fixture
def storage() -> FakeStorageServer:
    return FakeStorageServer()


@pytest.fixture
def admin_headers(db: Session, storage: FakeStorageServer) -> Iterator[dict[str, str]]:
    admin = make_admin(db)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    app.dependency_overrides[get_storage] = storage.client
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)
    app.dependency_overrides.pop(get_storage, None)


@pytest.mark.parametrize(
    ("data", "expected"),
    [
        (PNG_BYTES, ImageFormat.PNG),
        (JPEG_BYTES, ImageFormat.JPEG),
        (WEBP_BYTES, ImageFormat.WEBP),
        (b"GIF89a" + b"\x00" * 16, None),
        (b"<svg xmlns='http://www.w3.org/2000/svg'/>", None),
    ],
)
def test_detects_format_from_file_signature(data: bytes, expected: ImageFormat | None) -> None:
    assert detect_image_format(data) is expected


def test_upload_stores_image_and_returns_public_url(
    client: TestClient, admin_headers: dict[str, str], storage: FakeStorageServer
) -> None:
    # The file name claims .gif, but the content is a PNG: the content decides.
    response = client.post(
        UPLOAD_URL, files={"file": ("sneaky.gif", PNG_BYTES, "image/gif")}, headers=admin_headers
    )

    assert response.status_code == 201
    url = response.json()["url"]
    assert url.startswith(f"{TEST_SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/images/")
    assert url.endswith(".png")
    [upload] = storage.uploads
    assert upload.headers["content-type"] == ImageFormat.PNG
    assert upload.headers["apikey"] == "sb_secret_test"
    assert upload.content == PNG_BYTES


@pytest.mark.parametrize(
    ("data", "message_fragment"),
    [
        (b"not an image at all", UNSUPPORTED_IMAGE),
        (PNG_BYTES + b"\x00" * MAX_IMAGE_BYTES, "up to"),
        (b"", "empty"),
    ],
    ids=["not an image", "too large", "empty"],
)
def test_rejects_bad_uploads(
    client: TestClient,
    admin_headers: dict[str, str],
    storage: FakeStorageServer,
    data: bytes,
    message_fragment: str,
) -> None:
    response = client.post(
        UPLOAD_URL, files={"file": ("x.png", data, "image/png")}, headers=admin_headers
    )

    assert response.status_code == 422
    assert message_fragment in response.json()["detail"]
    assert storage.uploads == []


def test_upload_requires_an_admin(client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        response = client.post(UPLOAD_URL, files={"file": ("x.png", PNG_BYTES, "image/png")})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert response.status_code == 401


def test_ensure_bucket_creates_public_bucket_once(storage: FakeStorageServer) -> None:
    client = storage.client()

    assert client.ensure_bucket() is True
    assert client.ensure_bucket() is False
