import uuid
from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.supabase import get_token_verifier
from app.modules.content.defaults import DEFAULT_SECTIONS, DEFAULT_SETTINGS, DEFAULT_THEME
from app.modules.content.enums import SectionType
from app.modules.content.service import SeedResult, seed_defaults
from app.modules.media.storage import public_url_prefix
from tests.factories import make_admin
from tests.query_counter import QueryCounter

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


@pytest.fixture(autouse=True)
def seeded(db: Session, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.core.config.settings.supabase_url", TEST_SUPABASE_URL)
    seed_defaults(db)


@pytest.fixture
def admin_headers(db: Session) -> Iterator[dict[str, str]]:
    admin = make_admin(db, role=AdminRole.STAFF)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


def hosted_image(name: str = "photo.jpg") -> dict[str, str]:
    return {"url": f"{public_url_prefix(TEST_SUPABASE_URL)}images/{name}", "alt": "A popcorn cart"}


def default_content(section_type: SectionType) -> dict[str, Any]:
    return dict(next(content for kind, content in DEFAULT_SECTIONS if kind is section_type))


def admin_sections(client: TestClient, headers: dict[str, str]) -> list[dict[str, Any]]:
    return client.get(f"{ADMIN_URL}/sections", headers=headers).json()


def section_id(client: TestClient, headers: dict[str, str], section_type: SectionType) -> int:
    return next(s["id"] for s in admin_sections(client, headers) if s["type"] == section_type)


def public_types(client: TestClient) -> list[str]:
    return [section["type"] for section in client.get(SITE_URL).json()["sections"]]


# ---------------------------------------------------------------- Public site


def test_public_site_returns_settings_theme_and_sections_in_order(client: TestClient) -> None:
    body = client.get(SITE_URL).json()

    assert body["settings"]["business_name"] == DEFAULT_SETTINGS["business_name"]
    assert body["theme"]["colors"] == DEFAULT_THEME["colors"]
    assert body["theme"]["heading_font"] == "Shrikhand"
    assert [section["type"] for section in body["sections"]] == DEFAULT_ORDER
    assert all(isinstance(section["id"], int) for section in body["sections"])
    assert body["sections"][0]["content"]["image"] is None


def test_public_site_query_count_is_constant(
    client: TestClient, query_counter: QueryCounter
) -> None:
    with query_counter.measure() as queries:
        client.get(SITE_URL)

    # Settings, theme, and all sections.
    assert queries() == 3


def test_seed_is_idempotent(db: Session) -> None:
    assert seed_defaults(db) == SeedResult(
        settings_created=False, theme_created=False, sections_added=0
    )


# ---------------------------------------------------------------- Admin auth


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/settings"),
        ("put", "/theme"),
        ("get", "/sections"),
        ("post", "/sections"),
        ("put", "/sections/order"),
        ("put", "/sections/1/content"),
        ("patch", "/sections/1/visibility"),
        ("delete", "/sections/1"),
    ],
)
def test_admin_endpoints_require_sign_in(client: TestClient, method: str, path: str) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        response = client.request(method, f"{ADMIN_URL}{path}", json={})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert response.status_code == 401


# ---------------------------------------------------------------- Settings and theme


def test_admin_updates_settings(client: TestClient, admin_headers: dict[str, str]) -> None:
    new_settings = DEFAULT_SETTINGS | {"business_name": "  Red Wagon Pops  ", "email": None}

    response = client.put(f"{ADMIN_URL}/settings", json=new_settings, headers=admin_headers)

    assert response.status_code == 200
    public = client.get(SITE_URL).json()["settings"]
    assert (public["business_name"], public["email"]) == ("Red Wagon Pops", None)


@pytest.mark.parametrize(
    "overrides",
    [{"business_name": " "}, {"phone_e164": "404-555-0147"}, {"unexpected": "field"}],
)
def test_invalid_settings_are_rejected(
    client: TestClient, admin_headers: dict[str, str], overrides: dict[str, Any]
) -> None:
    response = client.put(
        f"{ADMIN_URL}/settings", json=DEFAULT_SETTINGS | overrides, headers=admin_headers
    )

    assert response.status_code == 422


def test_admin_updates_theme(client: TestClient, admin_headers: dict[str, str]) -> None:
    theme = {
        "colors": DEFAULT_THEME["colors"] | {"primary": "#0A7C66"},
        "heading_font": "Fraunces",
        "body_font": "Nunito",
    }

    response = client.put(f"{ADMIN_URL}/theme", json=theme, headers=admin_headers)

    assert response.status_code == 200
    public_theme = client.get(SITE_URL).json()["theme"]
    assert public_theme["colors"]["primary"] == "#0A7C66"
    assert (public_theme["heading_font"], public_theme["body_font"]) == ("Fraunces", "Nunito")


@pytest.mark.parametrize(
    "theme_overrides",
    [
        {"colors": DEFAULT_THEME["colors"] | {"primary": "red"}},
        {"colors": DEFAULT_THEME["colors"] | {"primary": "#12345"}},
        {"heading_font": "Comic Sans MS"},
        {"colors": {"primary": "#000000"}},
    ],
    ids=["named color", "short hex", "unknown font", "missing colors"],
)
def test_invalid_theme_is_rejected(
    client: TestClient, admin_headers: dict[str, str], theme_overrides: dict[str, Any]
) -> None:
    response = client.put(
        f"{ADMIN_URL}/theme", json=DEFAULT_THEME | theme_overrides, headers=admin_headers
    )

    assert response.status_code == 422


# ---------------------------------------------------------------- Built-in section content


def test_admin_edits_section_content(client: TestClient, admin_headers: dict[str, str]) -> None:
    faq_id = section_id(client, admin_headers, SectionType.FAQ)
    content = default_content(SectionType.FAQ) | {
        "items": [{"question": " New question? ", "answer": "New answer."}]
    }

    response = client.put(
        f"{ADMIN_URL}/sections/{faq_id}/content", json=content, headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json()["content"]["items"] == [
        {"question": "New question?", "answer": "New answer."}
    ]


def test_packages_menu_can_feature_a_package(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    menu_id = section_id(client, admin_headers, SectionType.PACKAGES_MENU)
    url = f"{ADMIN_URL}/sections/{menu_id}/content"

    featured = client.put(
        url,
        json=default_content(SectionType.PACKAGES_MENU) | {"featured_package_slug": "party-pop"},
        headers=admin_headers,
    )
    plain = default_content(SectionType.PACKAGES_MENU)
    cleared = client.put(url, json=plain, headers=admin_headers)

    assert featured.status_code == 200
    assert featured.json()["content"]["featured_package_slug"] == "party-pop"
    assert cleared.status_code == 200
    assert cleared.json()["content"]["featured_package_slug"] is None


def test_hero_accepts_an_uploaded_photo_only(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    hero_id = section_id(client, admin_headers, SectionType.HERO)
    url = f"{ADMIN_URL}/sections/{hero_id}/content"
    hosted = default_content(SectionType.HERO) | {"image": hosted_image()}
    external = default_content(SectionType.HERO) | {
        "image": {"url": "https://evil.example.com/x.jpg", "alt": "x"}
    }

    ok = client.put(url, json=hosted, headers=admin_headers)
    rejected = client.put(url, json=external, headers=admin_headers)

    assert ok.status_code == 200
    assert client.get(SITE_URL).json()["sections"][0]["content"]["image"] == hosted_image()
    assert rejected.status_code == 422
    assert "uploaded through the admin panel" in rejected.json()["detail"]


@pytest.mark.parametrize(
    ("section_type", "overrides", "error_fragment"),
    [
        (SectionType.HERO, {"headline": "a\nb\nc\nd\ne"}, "headline"),
        (SectionType.EVENT_TYPES, {"items": []}, "items"),
        (SectionType.FLAVORS, {"items": [{"name": "Pink", "color": "pink"}]}, "color"),
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
    target = section_id(client, admin_headers, section_type)

    response = client.put(
        f"{ADMIN_URL}/sections/{target}/content",
        json=default_content(section_type) | overrides,
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert error_fragment in response.json()["detail"]


def test_unknown_section_is_not_found(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.put(f"{ADMIN_URL}/sections/999999/content", json={}, headers=admin_headers)

    assert response.status_code == 404


# ---------------------------------------------------------------- Custom sections


def test_add_custom_section_lands_above_booking(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(f"{ADMIN_URL}/sections", json={"type": "story"}, headers=admin_headers)

    assert response.status_code == 201
    assert response.json()["is_removable"] is True
    types = [s["type"] for s in admin_sections(client, admin_headers)]
    assert types[-2:] == ["story", "booking"]
    assert [s["position"] for s in admin_sections(client, admin_headers)] == list(range(len(types)))


def test_custom_sections_can_repeat_and_be_deleted(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    first = client.post(f"{ADMIN_URL}/sections", json={"type": "text"}, headers=admin_headers)
    second = client.post(f"{ADMIN_URL}/sections", json={"type": "text"}, headers=admin_headers)
    assert public_types(client).count("text") == 2

    response = client.delete(f"{ADMIN_URL}/sections/{first.json()['id']}", headers=admin_headers)

    assert response.status_code == 204
    remaining_ids = {s["id"] for s in admin_sections(client, admin_headers)}
    assert first.json()["id"] not in remaining_ids
    assert second.json()["id"] in remaining_ids


def test_built_in_sections_cannot_be_added_again_or_deleted(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    faq_id = section_id(client, admin_headers, SectionType.FAQ)

    added = client.post(f"{ADMIN_URL}/sections", json={"type": "faq"}, headers=admin_headers)
    deleted = client.delete(f"{ADMIN_URL}/sections/{faq_id}", headers=admin_headers)

    assert (added.status_code, deleted.status_code) == (422, 422)
    assert public_types(client) == DEFAULT_ORDER


def test_empty_gallery_is_hidden_publicly_until_it_has_photos(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    gallery = client.post(
        f"{ADMIN_URL}/sections", json={"type": "gallery"}, headers=admin_headers
    ).json()
    assert "gallery" not in public_types(client)

    content = gallery["content"] | {"images": [hosted_image() | {"caption": "Spring wedding"}]}
    client.put(f"{ADMIN_URL}/sections/{gallery['id']}/content", json=content, headers=admin_headers)

    assert "gallery" in public_types(client)


@pytest.mark.parametrize(
    ("content", "error_fragment"),
    [
        ({"heading": "Go", "body": "", "button_label": "Visit", "button_target": "url"}, "link"),
        (
            {
                "heading": "Go",
                "button_label": "Visit",
                "button_target": "url",
                "button_url": "http://insecure.example.com",
            },
            "button_url",
        ),
    ],
)
def test_cta_link_rules(
    client: TestClient,
    admin_headers: dict[str, str],
    content: dict[str, Any],
    error_fragment: str,
) -> None:
    cta = client.post(f"{ADMIN_URL}/sections", json={"type": "cta"}, headers=admin_headers).json()

    response = client.put(
        f"{ADMIN_URL}/sections/{cta['id']}/content", json=content, headers=admin_headers
    )

    assert response.status_code == 422
    assert error_fragment in response.json()["detail"]


# ---------------------------------------------------------------- Visibility and order


def test_hidden_sections_disappear_from_public_site(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    flavors_id = section_id(client, admin_headers, SectionType.FLAVORS)

    response = client.patch(
        f"{ADMIN_URL}/sections/{flavors_id}/visibility",
        json={"is_visible": False},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert "flavors" not in public_types(client)


@pytest.mark.parametrize("section_type", [SectionType.HERO, SectionType.BOOKING])
def test_hero_and_booking_cannot_be_hidden(
    client: TestClient, admin_headers: dict[str, str], section_type: SectionType
) -> None:
    target = section_id(client, admin_headers, section_type)

    response = client.patch(
        f"{ADMIN_URL}/sections/{target}/visibility",
        json={"is_visible": False},
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_reorder_sections_by_id(client: TestClient, admin_headers: dict[str, str]) -> None:
    ids = [s["id"] for s in admin_sections(client, admin_headers)]
    new_order = [*reversed(ids)]

    response = client.put(
        f"{ADMIN_URL}/sections/order", json={"ids": new_order}, headers=admin_headers
    )

    assert response.status_code == 200
    assert [s["id"] for s in response.json()] == new_order
    assert public_types(client) == [*reversed(DEFAULT_ORDER)]


def test_reorder_must_list_every_section_once(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    ids = [s["id"] for s in admin_sections(client, admin_headers)]

    for bad in (ids[:-1], [*ids, ids[0]], [*ids[:-1], ids[0]]):
        response = client.put(
            f"{ADMIN_URL}/sections/order", json={"ids": bad}, headers=admin_headers
        )
        assert response.status_code == 422
