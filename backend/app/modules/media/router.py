from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.modules.auth import require_admin
from app.modules.media import service as media_service
from app.modules.media.constants import MAX_IMAGE_BYTES
from app.modules.media.schemas import UploadedImage
from app.modules.media.storage import SupabaseStorage, get_storage

router = APIRouter(
    prefix="/admin/media", tags=["admin media"], dependencies=[Depends(require_admin)]
)


@router.post("/images", response_model=UploadedImage, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: Annotated[UploadFile, File()],
    storage: Annotated[SupabaseStorage, Depends(get_storage)],
) -> UploadedImage:
    # Read one byte past the limit so oversized files are rejected without loading all of them.
    data = await file.read(MAX_IMAGE_BYTES + 1)
    return UploadedImage(url=media_service.upload_image(storage, data))
