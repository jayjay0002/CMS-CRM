import uuid

from app.core.config import settings
from app.core.errors import BusinessRuleError
from app.modules.media.constants import IMAGE_FOLDER, MAX_IMAGE_BYTES, MAX_IMAGE_MEGABYTES
from app.modules.media.enums import FILE_EXTENSIONS, ImageFormat
from app.modules.media.storage import SupabaseStorage, public_url_prefix

JPEG_SIGNATURE = b"\xff\xd8\xff"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
RIFF_SIGNATURE = b"RIFF"
WEBP_SIGNATURE = b"WEBP"
# "RIFF" (4 bytes) + file size (4 bytes) + "WEBP" (4 bytes).
WEBP_MARKER_START = 8
WEBP_MARKER_END = 12

UNSUPPORTED_IMAGE = "Upload a JPG, PNG or WebP image"


def detect_image_format(data: bytes) -> ImageFormat | None:
    """Identifies the format from the file's first bytes, so renamed files can't sneak in."""
    if data.startswith(JPEG_SIGNATURE):
        return ImageFormat.JPEG
    if data.startswith(PNG_SIGNATURE):
        return ImageFormat.PNG
    if (
        data.startswith(RIFF_SIGNATURE)
        and data[WEBP_MARKER_START:WEBP_MARKER_END] == WEBP_SIGNATURE
    ):
        return ImageFormat.WEBP
    return None


def upload_image(storage: SupabaseStorage, data: bytes) -> str:
    if not data:
        raise BusinessRuleError("The file is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise BusinessRuleError(f"Images can be up to {MAX_IMAGE_MEGABYTES} MB")
    image_format = detect_image_format(data)
    if image_format is None:
        raise BusinessRuleError(UNSUPPORTED_IMAGE)

    path = f"{IMAGE_FOLDER}/{uuid.uuid4()}.{FILE_EXTENSIONS[image_format]}"
    return storage.upload(path, data, image_format)


def is_hosted_image_url(url: str) -> bool:
    """True if the URL points at our own image bucket (content may only use uploaded images)."""
    return bool(settings.supabase_url) and url.startswith(public_url_prefix(settings.supabase_url))
