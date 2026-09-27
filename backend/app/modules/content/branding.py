from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.modules.content.constants import SITE_SETTINGS_ID, SITE_THEME_ID
from app.modules.content.defaults import DEFAULT_SETTINGS, DEFAULT_THEME
from app.modules.content.models import SiteSettings, SiteTheme


@dataclass(frozen=True)
class Branding:
    """Business info and colors for anything branded outside the website (e.g. emails)."""

    business_name: str
    phone_display: str
    phone_e164: str
    email: str | None
    background_color: str
    surface_color: str
    surface_soft_color: str
    text_color: str
    primary_color: str


def get_branding(db: Session) -> Branding:
    """Current settings and theme, falling back to the launch defaults if not seeded yet."""
    settings = db.get(SiteSettings, SITE_SETTINGS_ID)
    theme = db.get(SiteTheme, SITE_THEME_ID)
    colors = theme.colors if theme else DEFAULT_THEME["colors"]
    return Branding(
        business_name=settings.business_name if settings else DEFAULT_SETTINGS["business_name"],
        phone_display=settings.phone_display if settings else DEFAULT_SETTINGS["phone_display"],
        phone_e164=settings.phone_e164 if settings else DEFAULT_SETTINGS["phone_e164"],
        email=settings.email if settings else DEFAULT_SETTINGS["email"],
        background_color=colors["background"],
        surface_color=colors["surface"],
        surface_soft_color=colors["surface_soft"],
        text_color=colors["text"],
        primary_color=colors["primary"],
    )
