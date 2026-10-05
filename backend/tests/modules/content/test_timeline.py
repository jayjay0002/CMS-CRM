from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.modules.content.constants import (
    TIMELINE_CHAPTER_BODY_MAX_LENGTH,
    TIMELINE_MAX_CHAPTERS,
)
from tests.modules.content.helpers import ADMIN_URL, hosted_image, public_types

TIMELINE = "timeline"


def chapter(index: int = 1) -> dict[str, Any]:
    return {
        "kicker": f"Chapter {index}",
        "title": "Down to the bones",
        "body": "A bare steel frame on a dolly.",
        "image": hosted_image(f"chapter-{index}.jpg"),
    }


def add_timeline(client: TestClient, headers: dict[str, str]) -> dict[str, Any]:
    response = client.post(f"{ADMIN_URL}/sections", json={"type": TIMELINE}, headers=headers)
    assert response.status_code == 201
    return response.json()


def put_chapters(
    client: TestClient, headers: dict[str, str], section: dict[str, Any], chapters: list[Any]
) -> int:
    response = client.put(
        f"{ADMIN_URL}/sections/{section['id']}/content",
        json=section["content"] | {"chapters": chapters},
        headers=headers,
    )
    return response.status_code


def test_new_timeline_is_hidden_publicly_until_it_has_chapters(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    timeline = add_timeline(client, admin_headers)

    assert timeline["content"]["chapters"] == []
    assert TIMELINE not in public_types(client)

    assert put_chapters(client, admin_headers, timeline, [chapter()]) == 200
    assert TIMELINE in public_types(client)


def test_timeline_rejects_too_many_chapters(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    timeline = add_timeline(client, admin_headers)
    chapters = [chapter(index) for index in range(TIMELINE_MAX_CHAPTERS + 1)]

    assert put_chapters(client, admin_headers, timeline, chapters) == 422


@pytest.mark.parametrize(
    "broken",
    [
        {"image": None},
        {"image": {"url": "https://example.com/photo.jpg", "alt": "Elsewhere"}},
        {"body": "x" * (TIMELINE_CHAPTER_BODY_MAX_LENGTH + 1)},
        {"title": ""},
    ],
)
def test_timeline_rejects_invalid_chapters(
    client: TestClient, admin_headers: dict[str, str], broken: dict[str, Any]
) -> None:
    timeline = add_timeline(client, admin_headers)

    assert put_chapters(client, admin_headers, timeline, [chapter() | broken]) == 422
