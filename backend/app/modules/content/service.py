from collections.abc import Sequence
from typing import Any

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, NotFoundError
from app.modules.content.constants import HOME_PAGE, SITE_SETTINGS_ID
from app.modules.content.defaults import DEFAULT_SECTIONS, DEFAULT_SETTINGS
from app.modules.content.enums import ALWAYS_VISIBLE_SECTIONS, SectionType
from app.modules.content.models import PageSection, SiteSettings
from app.modules.content.schemas import (
    CONTENT_MODELS,
    AdminSection,
    PublicSection,
    PublicSite,
    SiteSettingsBody,
    SiteSettingsRead,
)

NOT_SEEDED = "Site content isn't set up yet. Run: python -m app.cli seed-content"


def _describe_validation_error(error: ValidationError) -> str:
    """Turns pydantic's error list into one sentence the admin can act on."""
    first = error.errors()[0]
    location = ".".join(str(part) for part in first["loc"])
    return f"{location}: {first['msg']}" if location else first["msg"]


def validate_content(section_type: SectionType, raw: dict[str, Any]) -> dict[str, Any]:
    try:
        content = CONTENT_MODELS[section_type].model_validate(raw)
    except ValidationError as error:
        raise BusinessRuleError(_describe_validation_error(error)) from error
    return content.model_dump(mode="json")


def to_admin_section(section: PageSection) -> AdminSection:
    return AdminSection(
        type=section.section_type,
        position=section.position,
        is_visible=section.is_visible,
        content=section.content,
    )


# ---------------------------------------------------------------- Reads


def get_settings(db: Session) -> SiteSettings:
    settings = db.get(SiteSettings, SITE_SETTINGS_ID)
    if settings is None:
        raise NotFoundError(NOT_SEEDED)
    return settings


def list_sections(db: Session, *, visible_only: bool = False) -> Sequence[PageSection]:
    statement = select(PageSection).where(PageSection.page == HOME_PAGE)
    if visible_only:
        statement = statement.where(PageSection.is_visible)
    return db.scalars(statement.order_by(PageSection.position)).all()


def get_public_site(db: Session) -> PublicSite:
    return PublicSite(
        settings=SiteSettingsRead.model_validate(get_settings(db)),
        sections=[
            PublicSection(type=section.section_type, content=section.content)
            for section in list_sections(db, visible_only=True)
        ],
    )


def get_section(db: Session, section_type: SectionType) -> PageSection:
    statement = select(PageSection).where(
        PageSection.page == HOME_PAGE, PageSection.section_type == section_type
    )
    section = db.scalars(statement).one_or_none()
    if section is None:
        raise NotFoundError(f"The {section_type.value} section doesn't exist. {NOT_SEEDED}")
    return section


# ---------------------------------------------------------------- Writes


def update_settings(db: Session, data: SiteSettingsBody) -> SiteSettings:
    settings = get_settings(db)
    for field, value in data.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    return settings


def update_section_content(
    db: Session, section_type: SectionType, raw: dict[str, Any]
) -> PageSection:
    section = get_section(db, section_type)
    section.content = validate_content(section_type, raw)
    db.commit()
    return section


def set_section_visibility(db: Session, section_type: SectionType, is_visible: bool) -> PageSection:
    if not is_visible and section_type in ALWAYS_VISIBLE_SECTIONS:
        raise BusinessRuleError(f"The {section_type.value} section can't be hidden")
    section = get_section(db, section_type)
    section.is_visible = is_visible
    db.commit()
    return section


def reorder_sections(db: Session, types: list[SectionType]) -> Sequence[PageSection]:
    sections = list_sections(db)
    current_types = [section.section_type for section in sections]
    if len(types) != len(set(types)) or set(types) != set(current_types):
        raise BusinessRuleError("List every section exactly once to change the order")

    position_of = {section_type: index for index, section_type in enumerate(types)}
    for section in sections:
        section.position = position_of[section.section_type]
    db.commit()
    return sorted(sections, key=lambda section: section.position)


def seed_defaults(db: Session) -> tuple[bool, int]:
    """Adds the settings row and any missing sections.

    Returns (settings_created, sections_added).
    """
    settings_created = db.get(SiteSettings, SITE_SETTINGS_ID) is None
    if settings_created:
        db.add(SiteSettings(id=SITE_SETTINGS_ID, **DEFAULT_SETTINGS))

    existing = {section.section_type for section in list_sections(db)}
    missing = [
        PageSection(
            page=HOME_PAGE,
            section_type=section_type,
            position=position,
            is_visible=True,
            content=validate_content(section_type, content),
        )
        for position, (section_type, content) in enumerate(DEFAULT_SECTIONS)
        if section_type not in existing
    ]
    db.add_all(missing)
    db.commit()
    return settings_created, len(missing)
