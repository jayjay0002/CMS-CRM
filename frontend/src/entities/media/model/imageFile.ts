import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_MEGABYTES } from '../config/limits'

const ACCEPTED: ReadonlySet<string> = new Set(ACCEPTED_IMAGE_TYPES)

// A sentence explaining why the file can't be used, or null if it looks fine.
export function imageFileProblem(file: File): string | null {
  if (!ACCEPTED.has(file.type)) return 'Choose a JPG, PNG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return `That image is too big. Use one up to ${MAX_IMAGE_MEGABYTES} MB.`
  return null
}
