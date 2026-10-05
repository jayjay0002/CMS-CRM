from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, NotFoundError
from app.modules.content.constants import HOME_PAGE, SITE_SETTINGS_ID, SITE_THEME_ID
from app.modules.content.defaults import (
    DEFAULT_SECTIONS,
    DEFAULT_SETTINGS,
    DEFAULT_THEME,
    NEW_SECTION_CONTENT,
)
from app.modules.content.enums import ALWAYS_VISIBLE_SECTIONS, CUSTOM_SECTIONS, SectionType
from app.modules.content.models import PageSection, SiteSettings, SiteTheme
from app.modules.content.schemas import (
    CONTENT_MODELS,
    AdminSection,
    PublicSection,
    PublicSite,
    SiteSettingsBody,
    SiteSettingsRead,
    ThemeBody,
    ThemeRead,
)

NOT_SEEDED = "Site content isn't set up yet. Run: python -m app.cli seed-content"


def _describe_validation_error(error: ValidationError) -> str:
    """Turns pydantic's error list into one sentence the admin can act on."""
    first = error.errors()[0]
    location = ".".join(str(part) for part in first["loc"])
    message = first["msg"].removeprefix("Value error, ")
    return f"{location}: {message}" if location else message


def validate_content(section_type: SectionType, raw: dict[str, Any]) -> dict[str, Any]:
    try:
        content = CONTENT_MODELS[section_type].model_validate(raw)
    except ValidationError as error:
        raise BusinessRuleError(_describe_validation_error(error)) from error
    return content.model_dump(mode="json")


def to_admin_section(section: PageSection) -> AdminSection:
    return AdminSection(
        id=section.id,
        type=section.section_type,
        position=section.position,
        is_visible=section.is_visible,
        is_removable=section.section_type in CUSTOM_SECTIONS,
        content=section.content,
    )


# Sections whose list starts empty while the owner sets them up; empty ones stay off the page.
LIST_REQUIRED_PUBLICLY = {SectionType.GALLERY: "images", SectionType.TIMELINE: "chapters"}


def _has_public_content(section: PageSection) -> bool:
    field = LIST_REQUIRED_PUBLICLY.get(section.section_type)
    return field is None or bool(section.content.get(field))


# ---------------------------------------------------------------- Reads


def get_settings(db: Session) -> SiteSettings:
    settings = db.get(SiteSettings, SITE_SETTINGS_ID)
    if settings is None:
        raise NotFoundError(NOT_SEEDED)
    return settings


def get_theme(db: Session) -> SiteTheme:
    theme = db.get(SiteTheme, SITE_THEME_ID)
    if theme is None:
        raise NotFoundError(NOT_SEEDED)
    return theme


def list_sections(db: Session, *, visible_only: bool = False) -> Sequence[PageSection]:
    statement = select(PageSection).where(PageSection.page == HOME_PAGE)
    if visible_only:
        statement = statement.where(PageSection.is_visible)
    return db.scalars(statement.order_by(PageSection.position, PageSection.id)).all()


def get_public_site(db: Session) -> PublicSite:
    return PublicSite(
        settings=SiteSettingsRead.model_validate(get_settings(db)),
        theme=ThemeRead.model_validate(get_theme(db)),
        sections=[
            PublicSection(id=section.id, type=section.section_type, content=section.content)
            for section in list_sections(db, visible_only=True)
            if _has_public_content(section)
        ],
    )


def get_section(db: Session, section_id: int) -> PageSection:
    section = db.get(PageSection, section_id)
    if section is None or section.page != HOME_PAGE:
        raise NotFoundError("That section doesn't exist")
    return section


# ---------------------------------------------------------------- Writes


def update_settings(db: Session, data: SiteSettingsBody) -> SiteSettings:
    settings = get_settings(db)
    for field, value in data.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    return settings


def update_theme(db: Session, data: ThemeBody) -> SiteTheme:
    theme = get_theme(db)
    values = data.model_dump(mode="json")
    theme.colors = values["colors"]
    theme.heading_font = values["heading_font"]
    theme.body_font = values["body_font"]
    db.commit()
    return theme


def update_section_content(db: Session, section_id: int, raw: dict[str, Any]) -> PageSection:
    section = get_section(db, section_id)
    section.content = validate_content(section.section_type, raw)
    db.commit()
    return section


def set_section_visibility(db: Session, section_id: int, is_visible: bool) -> PageSection:
    section = get_section(db, section_id)
    if not is_visible and section.section_type in ALWAYS_VISIBLE_SECTIONS:
        raise BusinessRuleError(f"The {section.section_type.value} section can't be hidden")
    section.is_visible = is_visible
    db.commit()
    return section


def add_section(db: Session, section_type: SectionType) -> PageSection:
    """Adds a custom section with starter content, just above the booking section."""
    if section_type not in CUSTOM_SECTIONS:
        raise BusinessRuleError(
            "Only story, gallery, timeline, text and call-to-action sections can be added"
        )

    sections = list(list_sections(db))
    booking_index = next(
        (i for i, s in enumerate(sections) if s.section_type is SectionType.BOOKING), len(sections)
    )
    section = PageSection(
        page=HOME_PAGE,
        section_type=section_type,
        position=booking_index,
        is_visible=True,
        content=validate_content(section_type, NEW_SECTION_CONTENT[section_type]),
    )
    sections.insert(booking_index, section)
    db.add(section)
    for position, existing in enumerate(sections):
        existing.position = position
    db.commit()
    return section


def delete_section(db: Session, section_id: int) -> None:
    section = get_section(db, section_id)
    if section.section_type not in CUSTOM_SECTIONS:
        raise BusinessRuleError("Built-in sections can be hidden but not deleted")
    db.delete(section)
    db.commit()


def reorder_sections(db: Session, ids: list[int]) -> Sequence[PageSection]:
    sections = list_sections(db)
    current_ids = [section.id for section in sections]
    if len(ids) != len(set(ids)) or set(ids) != set(current_ids):
        raise BusinessRuleError("List every section exactly once to change the order")

    position_of = {section_id: index for index, section_id in enumerate(ids)}
    for section in sections:
        section.position = position_of[section.id]
    db.commit()
    return sorted(sections, key=lambda section: section.position)


# ---------------------------------------------------------------- Seeding


@dataclass(frozen=True)
class SeedResult:
    settings_created: bool
    theme_created: bool
    sections_added: int


def seed_defaults(db: Session) -> SeedResult:
    """Adds the settings row, the theme row and any missing built-in sections."""
    settings_created = db.get(SiteSettings, SITE_SETTINGS_ID) is None
    if settings_created:
        db.add(SiteSettings(id=SITE_SETTINGS_ID, **DEFAULT_SETTINGS))

    theme_created = db.get(SiteTheme, SITE_THEME_ID) is None
    if theme_created:
        theme = ThemeBody.model_validate(DEFAULT_THEME).model_dump(mode="json")
        db.add(SiteTheme(id=SITE_THEME_ID, **theme))

    sections = list_sections(db)
    existing = {section.section_type for section in sections}
    next_position = db.scalar(
        select(func.coalesce(func.max(PageSection.position) + 1, 0)).where(
            PageSection.page == HOME_PAGE
        )
    )
    missing = [
        PageSection(
            page=HOME_PAGE,
            section_type=section_type,
            position=next_position + offset,
            is_visible=True,
            content=validate_content(section_type, content),
        )
        for offset, (section_type, content) in enumerate(
            (section_type, content)
            for section_type, content in DEFAULT_SECTIONS
            if section_type not in existing
        )
    ]
    db.add_all(missing)
    db.commit()
    return SeedResult(settings_created, theme_created, len(missing))
