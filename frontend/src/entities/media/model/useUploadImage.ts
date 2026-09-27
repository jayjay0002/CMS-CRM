import { useMutation } from '@tanstack/react-query'

import { uploadImage } from '../api/uploadImage'

export function useUploadImage() {
  return useMutation({ mutationFn: uploadImage })
}
