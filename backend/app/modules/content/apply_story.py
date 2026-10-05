"""One-time rewrite of the live page into the wagon's story (the `apply-story` command)."""

from collections.abc import Callable, Sequence

from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError
from app.modules.content.constants import HOME_PAGE
from app.modules.content.defaults import DEFAULT_SECTIONS, DEFAULT_SETTINGS
from app.modules.content.enums import BUILT_IN_SECTIONS, CUSTOM_SECTIONS, SectionType
from app.modules.content.models import PageSection
from app.modules.content.service import get_settings, list_sections, validate_content
from app.modules.content.story import (
    STORY_PHOTOS,
    STORY_PHOTOS_DIR,
    STORY_SETTING_FIELDS,
    story_sections,
)

STORY_ALREADY_APPLIED = "The story is already on the page"

# Reading order of the story; any other custom sections go between these and booking.
ARC_ORDER = (
    SectionType.HERO,
    SectionType.STORY,
    SectionType.TIMELINE,
    SectionType.EVENT_TYPES,
    SectionType.FLAVORS,
    SectionType.PACKAGES_MENU,
    SectionType.HOW_IT_WORKS,
    SectionType.FAQ,
    SectionType.CTA,
)


def _upload_photos(upload: Callable[[bytes], str]) -> dict[str, str]:
    return {
        photo.file_name: upload((STORY_PHOTOS_DIR / photo.file_name).read_bytes())
        for photo in STORY_PHOTOS
    }


def _rewrite_built_ins(sections: Sequence[PageSection]) -> None:
    defaults = dict(DEFAULT_SECTIONS)
    for section in sections:
        if section.section_type in defaults:
            section.content = validate_content(section.section_type, defaults[section.section_type])


def _story_order(
    existing: Sequence[PageSection], added: Sequence[PageSection]
) -> list[PageSection]:
    """Built-ins and new story sections in arc order, then other custom sections, then booking."""
    arc_rank = {section_type: rank for rank, section_type in enumerate(ARC_ORDER)}
    arc = [
        *(
            s
            for s in existing
            if s.section_type in BUILT_IN_SECTIONS and s.section_type in arc_rank
        ),
        *added,
    ]
    arc.sort(key=lambda section: arc_rank[section.section_type])
    custom = [s for s in existing if s.section_type in CUSTOM_SECTIONS]
    booking = [s for s in existing if s.section_type is SectionType.BOOKING]
    return [*arc, *custom, *booking]


def apply_story(db: Session, upload: Callable[[bytes], str]) -> int:
    """Uploads the story photos, then rewrites settings and sections in one transaction.

    Returns how many sections the page has afterwards. Refuses to run twice.
    """
    existing = list(list_sections(db))
    if any(section.section_type is SectionType.TIMELINE for section in existing):
        raise BusinessRuleError(STORY_ALREADY_APPLIED)
    # Uploads come first so a storage failure leaves the page untouched.
    photo_urls = _upload_photos(upload)

    settings = get_settings(db)
    for field in STORY_SETTING_FIELDS:
        setattr(settings, field, DEFAULT_SETTINGS[field])
    _rewrite_built_ins(existing)
    added = [
        PageSection(
            page=HOME_PAGE,
            section_type=section_type,
            position=0,
            is_visible=True,
            content=validate_content(section_type, content),
        )
        for section_type, content in story_sections(photo_urls)
    ]
    db.add_all(added)
    ordered = _story_order(existing, added)
    for position, section in enumerate(ordered):
        section.position = position
    db.commit()
    return len(ordered)
