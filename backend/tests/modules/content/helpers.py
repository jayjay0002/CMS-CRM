"""Constants and request helpers shared by the content tests."""

import uuid
from typing import Any

from fastapi.testclient import TestClient

from app.modules.content.defaults import DEFAULT_SECTIONS
from app.modules.content.enums import SectionType
from app.modules.media.storage import public_url_prefix

SITE_URL = "/api/v1/site"
ADMIN_URL = "/api/v1/admin/site"
TEST_SUPABASE_URL = "https://test-project.supabase.co"
DEFAULT_ORDER = [section_type.value for section_type, _ in DEFAULT_SECTIONS]


class FakeVerifier:
    """Accepts a token that is just the Supabase user id."""

    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


def hosted_url(name: str) -> str:
    return f"{public_url_prefix(TEST_SUPABASE_URL)}images/{name}"


def hosted_image(name: str = "photo.jpg") -> dict[str, str]:
    return {"url": hosted_url(name), "alt": "A popcorn cart"}


def default_content(section_type: SectionType) -> dict[str, Any]:
    return dict(next(content for kind, content in DEFAULT_SECTIONS if kind is section_type))


def admin_sections(client: TestClient, headers: dict[str, str]) -> list[dict[str, Any]]:
    return client.get(f"{ADMIN_URL}/sections", headers=headers).json()


def section_id(client: TestClient, headers: dict[str, str], section_type: SectionType) -> int:
    return next(s["id"] for s in admin_sections(client, headers) if s["type"] == section_type)


def public_types(client: TestClient) -> list[str]:
    return [section["type"] for section in client.get(SITE_URL).json()["sections"]]
