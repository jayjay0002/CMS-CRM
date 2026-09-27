// Mirrors backend/app/modules/media (constants.py and enums.py). The backend re-checks every file
// by its content; these checks just give faster, friendlier feedback.

const BYTES_PER_MEGABYTE = 1_048_576

export const MAX_IMAGE_MEGABYTES = 5
export const MAX_IMAGE_BYTES = MAX_IMAGE_MEGABYTES * BYTES_PER_MEGABYTE

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// For the file picker's `accept` attribute.
export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(',')

export const IMAGE_RULES_TEXT = `JPG, PNG or WebP, up to ${MAX_IMAGE_MEGABYTES} MB.`
