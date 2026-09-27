from enum import StrEnum


class ImageFormat(StrEnum):
    """Accepted image types, identified by their file signature (not the file name)."""

    JPEG = "image/jpeg"
    PNG = "image/png"
    WEBP = "image/webp"


FILE_EXTENSIONS: dict[ImageFormat, str] = {
    ImageFormat.JPEG: "jpg",
    ImageFormat.PNG: "png",
    ImageFormat.WEBP: "webp",
}
