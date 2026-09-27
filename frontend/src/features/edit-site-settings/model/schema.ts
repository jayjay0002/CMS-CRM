import { z } from 'zod'

import { PHONE_E164_PATTERN, SETTINGS_LIMITS, type SiteSettings, WEB_URL_PATTERN } from '@/entities/site'
import { emptyToNull, optionalText, requiredText } from '@/shared/lib'

const emailSchema = z.email()

export const siteSettingsSchema = z.object({
  businessName: requiredText(SETTINGS_LIMITS.businessName, 'Enter the business name'),
  tagline: requiredText(SETTINGS_LIMITS.tagline, 'Enter a short tagline'),
  phoneDisplay: requiredText(SETTINGS_LIMITS.phoneDisplay, 'Enter the phone number'),
  phoneE164: z
    .string()
    .trim()
    .regex(PHONE_E164_PATTERN, 'Use the international format, like +14045550147'),
  email: optionalText(SETTINGS_LIMITS.email).refine(
    (value) => value === '' || emailSchema.safeParse(value).success,
    'Enter an email like you@example.com',
  ),
  instagramHandle: optionalText(SETTINGS_LIMITS.instagramHandle),
  instagramUrl: optionalText(SETTINGS_LIMITS.instagramUrl).refine(
    (value) => value === '' || WEB_URL_PATTERN.test(value),
    'Start the link with https://',
  ),
  serviceArea: requiredText(SETTINGS_LIMITS.serviceArea, 'Enter the area you serve'),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>

export function toFormValues(settings: SiteSettings): SiteSettingsFormValues {
  return {
    ...settings,
    email: settings.email ?? '',
    instagramHandle: settings.instagramHandle ?? '',
    instagramUrl: settings.instagramUrl ?? '',
  }
}

export function toSiteSettings(values: SiteSettingsFormValues): SiteSettings {
  return {
    ...values,
    email: emptyToNull(values.email),
    instagramHandle: emptyToNull(values.instagramHandle),
    instagramUrl: emptyToNull(values.instagramUrl),
  }
}
