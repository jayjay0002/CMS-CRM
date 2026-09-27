from typing import Any

from sqlalchemy import Enum, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import MAX_EMAIL_LENGTH, URL_MAX_LENGTH
from app.db.base import Base, TimestampMixin, enum_values
from app.modules.content.constants import (
    BUSINESS_NAME_MAX_LENGTH,
    INSTAGRAM_HANDLE_MAX_LENGTH,
    PAGE_KEY_MAX_LENGTH,
    PHONE_DISPLAY_MAX_LENGTH,
    PHONE_E164_MAX_LENGTH,
    SERVICE_AREA_MAX_LENGTH,
    TAGLINE_MAX_LENGTH,
)
from app.modules.content.enums import SectionType


class SiteSettings(TimestampMixin, Base):
    """Business info shown across the site. A single row (id = SITE_SETTINGS_ID)."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_name: Mapped[str] = mapped_column(String(BUSINESS_NAME_MAX_LENGTH))
    tagline: Mapped[str] = mapped_column(String(TAGLINE_MAX_LENGTH))
    phone_display: Mapped[str] = mapped_column(String(PHONE_DISPLAY_MAX_LENGTH))
    phone_e164: Mapped[str] = mapped_column(String(PHONE_E164_MAX_LENGTH))
    email: Mapped[str | None] = mapped_column(String(MAX_EMAIL_LENGTH))
    instagram_handle: Mapped[str | None] = mapped_column(String(INSTAGRAM_HANDLE_MAX_LENGTH))
    instagram_url: Mapped[str | None] = mapped_column(String(URL_MAX_LENGTH))
    service_area: Mapped[str] = mapped_column(String(SERVICE_AREA_MAX_LENGTH))


class PageSection(TimestampMixin, Base):
    __tablename__ = "page_sections"
    __table_args__ = (UniqueConstraint("page", "section_type"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    page: Mapped[str] = mapped_column(String(PAGE_KEY_MAX_LENGTH))
    section_type: Mapped[SectionType] = mapped_column(
        Enum(SectionType, name="section_type", values_callable=enum_values)
    )
    position: Mapped[int]
    is_visible: Mapped[bool] = mapped_column(default=True)
    # Shape depends on section_type; always validated by schemas.CONTENT_MODELS before saving.
    content: Mapped[dict[str, Any]] = mapped_column(JSONB)
