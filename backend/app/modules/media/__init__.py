"""Media module: image uploads to Supabase Storage.

Public API for other modules.
"""

from app.modules.media.service import is_hosted_image_url, upload_image
from app.modules.media.storage import SupabaseStorage, get_storage

__all__ = ["SupabaseStorage", "get_storage", "is_hosted_image_url", "upload_image"]
