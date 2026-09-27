import { apiFetch } from '@/shared/api'

const UPLOAD_IMAGE_PATH = '/admin/media/images'
const FILE_FIELD = 'file'

type UploadedImageDto = { url: string }

// Uploads to the site's image storage and returns the public URL to save in content.
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append(FILE_FIELD, file)
  const { url } = await apiFetch<UploadedImageDto>(UPLOAD_IMAGE_PATH, { method: 'POST', body }, { auth: true })
  return url
}
