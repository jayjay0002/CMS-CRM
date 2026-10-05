from app.modules.content.defaults import DEFAULT_SECTIONS
from app.modules.content.enums import SectionType
from app.modules.content.service import validate_content
from app.modules.content.story import STORY_PHOTOS, STORY_PHOTOS_DIR, story_sections
from tests.modules.content.helpers import hosted_url


def fake_photo_urls() -> dict[str, str]:
    return {photo.file_name: hosted_url(photo.file_name) for photo in STORY_PHOTOS}


def test_every_story_photo_file_exists() -> None:
    for photo in STORY_PHOTOS:
        assert (STORY_PHOTOS_DIR / photo.file_name).is_file()


def test_story_sections_come_in_reading_order() -> None:
    kinds = [kind for kind, _ in story_sections(fake_photo_urls())]

    assert kinds == [SectionType.STORY, SectionType.TIMELINE, SectionType.CTA]


def test_story_sections_fit_their_schemas() -> None:
    for kind, content in story_sections(fake_photo_urls()):
        validate_content(kind, content)


def test_default_sections_fit_their_schemas() -> None:
    for kind, content in DEFAULT_SECTIONS:
        validate_content(kind, content)
