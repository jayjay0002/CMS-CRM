import { ApiError, HTTP_STATUS } from './apiFetch'

const INVALID_FIELDS = 'Some fields aren’t valid. Check them and try again.'
const COULD_NOT_SAVE = 'Couldn’t save. Check your connection and try again.'

// A sentence to show when saving fails: the server's own message when it sent one.
export function saveErrorMessage(error: Error): string {
  if (!(error instanceof ApiError)) return COULD_NOT_SAVE
  if (error.detail) return error.detail
  // FastAPI's request-validation 422 carries a list, not a sentence.
  if (error.status === HTTP_STATUS.unprocessable) return INVALID_FIELDS
  return COULD_NOT_SAVE
}
