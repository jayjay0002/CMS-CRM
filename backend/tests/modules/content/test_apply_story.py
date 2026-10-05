import pytest
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError
from app.modules.content.apply_story import apply_story
from app.modules.content.defaults import DEFAULT_SECTIONS, DEFAULT_SETTINGS
from app.modules.content.enums import SectionType
from app.modules.content.service import add_section, get_settings, list_sections
from app.modules.content.story import STORY_PHOTOS
from tests.modules.content.helpers import hosted_url

ARC_ORDER = [
    SectionType.HERO,
    SectionType.STORY,
    SectionType.TIMELINE,
    SectionType.EVENT_TYPES,
    SectionType.FLAVORS,
    SectionType.PACKAGES_MENU,
    SectionType.HOW_IT_WORKS,
    SectionType.FAQ,
    SectionType.CTA,
    SectionType.BOOKING,
]
OLD_PHONE = "(404) 555-0147"


class FakeUploader:
    """Hands out bucket URLs; set `fail_after` to make storage go down mid-way."""

    def __init__(self, fail_after: int | None = None) -> None:
        self.urls: list[str] = []
        self.fail_after = fail_after

    def __call__(self, data: bytes) -> str:
        if self.fail_after is not None and len(self.urls) >= self.fail_after:
            raise RuntimeError("Storage is down")
        assert data
        self.urls.append(hosted_url(f"{len(self.urls)}.jpg"))
        return self.urls[-1]


def section_types(db: Session) -> list[SectionType]:
    return [section.section_type for section in list_sections(db)]


def test_apply_story_sets_the_brochure_contact_details(db: Session) -> None:
    get_settings(db).phone_display = OLD_PHONE

    apply_story(db, FakeUploader())

    assert get_settings(db).phone_display == DEFAULT_SETTINGS["phone_display"]
    assert get_settings(db).email == DEFAULT_SETTINGS["email"]


def test_apply_story_lays_the_page_out_in_story_order(db: Session) -> None:
    assert apply_story(db, FakeUploader()) == len(ARC_ORDER)

    assert section_types(db) == ARC_ORDER
    assert [section.position for section in list_sections(db)] == list(range(len(ARC_ORDER)))


def test_apply_story_overwrites_built_in_copy(db: Session) -> None:
    hero = next(s for s in list_sections(db) if s.section_type is SectionType.HERO)
    hero.content = hero.content | {"headline": "Old headline"}

    apply_story(db, FakeUploader())

    expected = next(content for kind, content in DEFAULT_SECTIONS if kind is SectionType.HERO)
    assert hero.content["headline"] == expected["headline"]


def test_apply_story_keeps_existing_custom_sections_before_booking(db: Session) -> None:
    add_section(db, SectionType.TEXT)

    apply_story(db, FakeUploader())

    assert section_types(db)[-2:] == [SectionType.TEXT, SectionType.BOOKING]


def test_apply_story_uses_the_uploaded_photos(db: Session) -> None:
    uploader = FakeUploader()

    apply_story(db, uploader)

    timeline = next(s for s in list_sections(db) if s.section_type is SectionType.TIMELINE)
    chapter_urls = [chapter["image"]["url"] for chapter in timeline.content["chapters"]]
    assert len(uploader.urls) == len(STORY_PHOTOS)
    assert set(chapter_urls) <= set(uploader.urls)


def test_apply_story_refuses_a_second_run(db: Session) -> None:
    apply_story(db, FakeUploader())
    second = FakeUploader()

    with pytest.raises(BusinessRuleError):
        apply_story(db, second)

    assert second.urls == []
    assert section_types(db) == ARC_ORDER


def test_failed_upload_changes_nothing(db: Session) -> None:
    get_settings(db).phone_display = OLD_PHONE
    before = section_types(db)

    with pytest.raises(RuntimeError):
        apply_story(db, FakeUploader(fail_after=2))

    assert get_settings(db).phone_display == OLD_PHONE
    assert section_types(db) == before
