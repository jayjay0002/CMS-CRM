from typing import Any

from fastapi import APIRouter, Depends, Response, status

from app.core.dependencies import SessionDep
from app.modules.auth import require_admin
from app.modules.content import service as content_service
from app.modules.content.models import SiteSettings, SiteTheme
from app.modules.content.schemas import (
    AdminSection,
    PublicSite,
    SectionCreate,
    SectionOrderUpdate,
    SiteSettingsBody,
    SiteSettingsRead,
    ThemeBody,
    ThemeRead,
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


@admin_router.get("/theme", response_model=ThemeRead)
def read_theme(db: SessionDep) -> SiteTheme:
    return content_service.get_theme(db)


@admin_router.put("/theme", response_model=ThemeRead)
def update_theme(payload: ThemeBody, db: SessionDep) -> SiteTheme:
    return content_service.update_theme(db, payload)


@admin_router.get("/sections", response_model=list[AdminSection])
def list_sections(db: SessionDep) -> list[AdminSection]:
    return [
        content_service.to_admin_section(section) for section in content_service.list_sections(db)
    ]


@admin_router.post("/sections", response_model=AdminSection, status_code=status.HTTP_201_CREATED)
def add_section(payload: SectionCreate, db: SessionDep) -> AdminSection:
    return content_service.to_admin_section(content_service.add_section(db, payload.type))


# Declared before /sections/{section_id}/... so "order" isn't read as an id.
@admin_router.put("/sections/order", response_model=list[AdminSection])
def reorder_sections(payload: SectionOrderUpdate, db: SessionDep) -> list[AdminSection]:
    sections = content_service.reorder_sections(db, payload.ids)
    return [content_service.to_admin_section(section) for section in sections]


@admin_router.put("/sections/{section_id}/content", response_model=AdminSection)
def update_section_content(
    section_id: int, payload: dict[str, Any], db: SessionDep
) -> AdminSection:
    section = content_service.update_section_content(db, section_id, payload)
    return content_service.to_admin_section(section)


@admin_router.patch("/sections/{section_id}/visibility", response_model=AdminSection)
def set_section_visibility(
    section_id: int, payload: VisibilityUpdate, db: SessionDep
) -> AdminSection:
    section = content_service.set_section_visibility(db, section_id, payload.is_visible)
    return content_service.to_admin_section(section)


@admin_router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, db: SessionDep) -> Response:
    content_service.delete_section(db, section_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
