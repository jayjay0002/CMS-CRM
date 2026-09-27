// Mirrors backend/app/modules/content/constants.py. Keep them in sync.

export const SETTINGS_LIMITS = {
  businessName: 80,
  tagline: 160,
  phoneDisplay: 30,
  phoneE164: 20,
  email: 255,
  instagramHandle: 60,
  instagramUrl: 500,
  serviceArea: 80,
} as const

// E.164, e.g. +14045550147.
export const PHONE_E164_PATTERN = /^\+[1-9][0-9]{6,14}$/
export const WEB_URL_PATTERN = /^https?:\/\//

export const CONTENT_LIMITS = {
  heading: 60,
  label: 40,
  shortText: 300,
  heroHeadline: 80,
  heroHeadlineMaxLines: 4,
  heroDescription: 400,
  heroMaxHighlights: 5,
  highlight: 60,
  eventTypesMaxItems: 12,
  stepsMaxItems: 6,
  flavorsMaxItems: 12,
  faqMaxItems: 20,
  faqIntro: 200,
  faqQuestion: 150,
  faqAnswer: 800,
} as const
