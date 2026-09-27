import logging

from app.db.session import SessionLocal
from app.modules.content.service import seed_defaults

logger = logging.getLogger(__name__)


def seed_content() -> None:
    """Add default site settings, theme and any missing built-in sections (safe to run again)."""
    with SessionLocal() as db:
        result = seed_defaults(db)
    logger.info(
        "Settings %s, theme %s; added %d section(s)",
        "created" if result.settings_created else "kept",
        "created" if result.theme_created else "kept",
        result.sections_added,
    )
