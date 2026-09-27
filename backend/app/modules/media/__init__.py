"""Media module: image uploads to Supabase Storage.

Public API for other modules.
"""

from app.modules.media.service import is_hosted_image_url

__all__ = ["is_hosted_image_url"]
