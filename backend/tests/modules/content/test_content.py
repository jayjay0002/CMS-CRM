import uuid
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.supabase import get_token_verifier
from app.modules.content.defaults import DEFAULT_SECTIONS, DEFAULT_SETTINGS
from app.modules.content.enums import SectionType
from app.modules.content.service import seed_defaults
from tests.factories import make_admin
from tests.query_counter import QueryCounter

SITE_URL = "/api/v1/site"
ADMIN_URL = "/api/v1/admin/site"
DEFAULT_ORDER = [section_type.value for section_type, _ in DEFAULT_SECTIONS]


class FakeVerifier:
    """Accepts a token that is just the Supabase user id."""

    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


@pytest.fixture(autouse=True)
def seeded(db: Session) -> None:
    seed_defaults(db)


@pytest.fixture
def admin_headers(db: Session) -> Iterator[dict[str, str]]:
    admin = make_admin(db, role=AdminRole.STAFF)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


def section_content(section_type: SectionType) -> dict[str, Any]:
    return dict(next(content for kind, content in DEFAULT_SECTIONS if kind is section_type))


# ---------------------------------------------------------------- Public site


def test_public_site_returns_settings_and_sections_in_order(client: TestClient) -> None:
    body = client.get(SITE_URL).json()

    assert body["settings"]["business_name"] == DEFAULT_SETTINGS["business_name"]
    assert [section["type"] for section in body["sections"]] == DEFAULT_ORDER
    hero = body["sections"][0]["content"]
    assert hero["headline"] == "Fresh popcorn,\npopped right\nat your party."


def test_public_site_query_count_is_constant(
    client: TestClient, query_counter: QueryCounter
) -> None:
    with query_counter.measure() as queries:
        client.get(SITE_URL)

    # One for settings, one for all sections.
    assert queries() == 2


def test_seed_is_idempotent(db: Session) -> None:
    assert seed_defaults(db) == (False, 0)


# ---------------------------------------------------------------- Admin auth


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/settings"),
        ("put", "/settings"),
        ("get", "/sections"),
        ("put", "/sections/order"),
        ("put", "/sections/hero/content"),
        ("patch", "/sections/faq/visibility"),
    ],
)
def test_admin_endpoints_require_sign_in(client: TestClient, method: str, path: str) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        response = client.request(method, f"{ADMIN_URL}{path}", json={})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert response.status_code == 401


# ---------------------------------------------------------------- Settings


def test_admin_updates_settings_and_public_site_shows_them(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    new_settings = DEFAULT_SETTINGS | {"business_name": "  Red Wagon Pops  ", "email": None}

    response = client.put(f"{ADMIN_URL}/settings", json=new_settings, headers=admin_headers)

    assert response.status_code == 200
    public = client.get(SITE_URL).json()["settings"]
    assert public["business_name"] == "Red Wagon Pops"
    assert public["email"] is None


@pytest.mark.parametrize(
    "overrides",
    [
        {"business_name": " "},
        {"phone_e164": "404-555-0147"},
        {"email": "not-an-email"},
        {"instagram_url": "instagram.com/x"},
        {"unexpected": "field"},
    ],
)
def test_invalid_settings_are_rejected(
    client: TestClient, admin_headers: dict[str, str], overrides: dict[str, Any]
) -> None:
    response = client.put(
        f"{ADMIN_URL}/settings", json=DEFAULT_SETTINGS | overrides, headers=admin_headers
    )

    assert response.status_code == 422


# ---------------------------------------------------------------- Section content


def test_admin_edits_section_content(client: TestClient, admin_headers: dict[str, str]) -> None:
    content = section_content(SectionType.FAQ) | {
        "items": [{"question": " New question? ", "answer": "New answer."}]
    }

    response = client.put(f"{ADMIN_URL}/sections/faq/content", json=content, headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["content"]["items"] == [
        {"question": "New question?", "answer": "New answer."}
    ]
    public_faq = next(s for s in client.get(SITE_URL).json()["sections"] if s["type"] == "faq")
    assert public_faq["content"]["items"][0]["question"] == "New question?"


@pytest.mark.parametrize(
    ("section_type", "overrides", "error_fragment"),
    [
        (SectionType.HERO, {"headline": "a\nb\nc\nd\ne"}, "headline"),
        (SectionType.HERO, {"highlights": ["x"] * 6}, "highlights"),
        (SectionType.EVENT_TYPES, {"items": []}, "items"),
        (SectionType.FLAVORS, {"items": [{"name": "Pink", "color": "pink"}]}, "color"),
        (SectionType.FAQ, {"heading": "x" * 61}, "heading"),
        (SectionType.BOOKING, {"surprise": True}, "surprise"),
    ],
)
def test_invalid_section_content_is_rejected_with_a_readable_message(
    client: TestClient,
    admin_headers: dict[str, str],
    section_type: SectionType,
    overrides: dict[str, Any],
    error_fragment: str,
) -> None:
    content = section_content(section_type) | overrides

    response = client.put(
        f"{ADMIN_URL}/sections/{section_type.value}/content", json=content, headers=admin_headers
    )

    assert response.status_code == 422
    assert error_fragment in response.json()["detail"]


def test_unknown_section_type_is_rejected(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.put(f"{ADMIN_URL}/sections/gallery/content", json={}, headers=admin_headers)

    assert response.status_code == 422


# ---------------------------------------------------------------- Visibility and order


def test_hidden_sections_disappear_from_public_site(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.patch(
        f"{ADMIN_URL}/sections/flavors/visibility",
        json={"is_visible": False},
        headers=admin_headers,
    )

    assert response.status_code == 200
    public_types = [s["type"] for s in client.get(SITE_URL).json()["sections"]]
    assert "flavors" not in public_types
    admin_types = [
        s["type"] for s in client.get(f"{ADMIN_URL}/sections", headers=admin_headers).json()
    ]
    assert "flavors" in admin_types


@pytest.mark.parametrize("section_type", ["hero", "booking"])
def test_hero_and_booking_cannot_be_hidden(
    client: TestClient, admin_headers: dict[str, str], section_type: str
) -> None:
    response = client.patch(
        f"{ADMIN_URL}/sections/{section_type}/visibility",
        json={"is_visible": False},
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_reorder_sections(client: TestClient, admin_headers: dict[str, str]) -> None:
    new_order = [*reversed(DEFAULT_ORDER)]

    response = client.put(
        f"{ADMIN_URL}/sections/order", json={"types": new_order}, headers=admin_headers
    )

    assert response.status_code == 200
    assert [s["type"] for s in response.json()] == new_order
    assert [s["type"] for s in client.get(SITE_URL).json()["sections"]] == new_order


@pytest.mark.parametrize(
    "types",
    [DEFAULT_ORDER[:-1], [*DEFAULT_ORDER, "hero"], [*DEFAULT_ORDER[:-1], "hero"]],
    ids=["missing one", "extra duplicate", "duplicate instead of one"],
)
def test_reorder_must_list_every_section_once(
    client: TestClient, admin_headers: dict[str, str], types: list[str]
) -> None:
    response = client.put(
        f"{ADMIN_URL}/sections/order", json={"types": types}, headers=admin_headers
    )

    assert response.status_code == 422
