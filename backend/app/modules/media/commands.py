import logging

from app.modules.media.constants import STORAGE_BUCKET
from app.modules.media.storage import get_storage

logger = logging.getLogger(__name__)


def setup_storage() -> None:
    """Create the public image bucket in Supabase Storage (safe to run again)."""
    created = get_storage().ensure_bucket()
    logger.info("Bucket %s %s", STORAGE_BUCKET, "created" if created else "already exists")
