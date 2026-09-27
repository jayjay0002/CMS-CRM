STORAGE_BUCKET = "site-images"
IMAGE_FOLDER = "images"

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_MEGABYTES = MAX_IMAGE_BYTES // (1024 * 1024)

STORAGE_BUCKET_PATH = "/storage/v1/bucket"
STORAGE_OBJECT_PATH = "/storage/v1/object"
STORAGE_PUBLIC_OBJECT_PATH = "/storage/v1/object/public"
STORAGE_REQUEST_TIMEOUT_SECONDS = 30
# Browsers may cache uploaded images for a year: every upload gets a new, unique file name.
IMAGE_CACHE_CONTROL_SECONDS = 31_536_000
