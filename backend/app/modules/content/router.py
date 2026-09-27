from typing import Any

from fastapi import APIRouter, Depends

from app.core.dependencies import SessionDep
from app.modules.auth import require_admin
from app.modules.content import service as content_service
from app.modules.content.enums import SectionType
from app.modules.content.models import SiteSettings
from app.modules.content.schemas import (
    AdminSection,
    PublicSite,
    SectionOrderUpdate,
    SiteSettingsBody,
    SiteSettingsRead,
    VisibilityUpdate,
)

router = APIRouter(prefix="/site", tags=["site"])


@router.get("", response_model=PublicSite)
def read_site(db: SessionDep) -> PublicSite:
    return content_service.get_public_site(db)


admin_router = APIRouter(
    prefix="/admin/site", tags=["admin site"], dependencies=[Depends(require_admin)]
)


@admin_router.get("/settings", response_model=SiteSettingsRead)
def read_settings(db: SessionDep) -> SiteSettings:
    return content_service.get_settings(db)


@admin_router.put("/settings", response_model=SiteSettingsRead)
def update_settings(payload: SiteSettingsBody, db: SessionDep) -> SiteSettings:
    return content_service.update_settings(db, payload)


@admin_router.get("/sections", response_model=list[AdminSection])
def list_sections(db: SessionDep) -> list[AdminSection]:
    return [
        content_service.to_admin_section(section) for section in content_service.list_sections(db)
    ]


# Declared before /sections/{section_type}/... so "order" isn't read as a section type.
@admin_router.put("/sections/order", response_model=list[AdminSection])
def reorder_sections(payload: SectionOrderUpdate, db: SessionDep) -> list[AdminSection]:
    sections = content_service.reorder_sections(db, payload.types)
    return [content_service.to_admin_section(section) for section in sections]


@admin_router.put("/sections/{section_type}/content", response_model=AdminSection)
def update_section_content(
    section_type: SectionType, payload: dict[str, Any], db: SessionDep
) -> AdminSection:
    section = content_service.update_section_content(db, section_type, payload)
    return content_service.to_admin_section(section)


@admin_router.patch("/sections/{section_type}/visibility", response_model=AdminSection)
def set_section_visibility(
    section_type: SectionType, payload: VisibilityUpdate, db: SessionDep
) -> AdminSection:
    section = content_service.set_section_visibility(db, section_type, payload.is_visible)
    return content_service.to_admin_section(section)
