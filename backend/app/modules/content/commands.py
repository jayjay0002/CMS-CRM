import logging

from app.db.session import SessionLocal
from app.modules.content.service import seed_defaults

logger = logging.getLogger(__name__)


def seed_content() -> None:
    """Add the default site settings and any missing landing sections (safe to run again)."""
    with SessionLocal() as db:
        settings_created, sections_added = seed_defaults(db)
    logger.info(
        "Site settings %s; added %d section(s)",
        "created" if settings_created else "already existed",
        sections_added,
    )
