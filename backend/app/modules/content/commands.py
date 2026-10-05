import logging

from app.db.session import SessionLocal
from app.modules.content.apply_story import apply_story
from app.modules.content.service import seed_defaults
from app.modules.media import get_storage, upload_image

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


def apply_story_content() -> None:
    """Upload the story photos and rewrite the page as the wagon's story (runs once)."""
    storage = get_storage()
    with SessionLocal() as db:
        section_count = apply_story(db, lambda data: upload_image(storage, data))
    logger.info("Story applied; the page now has %d section(s)", section_count)
