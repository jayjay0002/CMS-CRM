import { z } from 'zod'

import {
  CONTENT_LIMITS as LIMITS,
  CTA_TARGETS,
  type CtaContent,
  type EventTypesContent,
  FLAVOR_COLORS,
  type GalleryContent,
  type HeroContent,
  HTTPS_URL_PATTERN,
  IMAGE_SIDES,
  type StoryContent,
} from '@/entities/site'
import { optionalText, requiredText } from '@/shared/lib'

function listSchema<T extends z.ZodType>(item: T, { min, max, noun }: { min: number; max: number; noun: string }) {
  return z
    .array(item)
    .min(min, `Add at least ${min} ${noun}`)
    .max(max, `Use at most ${max} ${noun}s`)
}

// Lists of plain strings are edited as { value } rows (react-hook-form's field arrays need objects).
const textRow = (max: number, emptyMessage: string) => z.object({ value: requiredText(max, emptyMessage) })

function headlineLineCount(headline: string): number {
  return headline.split('\n').filter((line) => line.trim().length > 0).length
}

// An uploaded image with its description (alt text).
const imageSchema = z.object({
  url: z.string().min(1),
  alt: requiredText(LIMITS.imageAlt, 'Describe the photo in a few words'),
})

// What the hero shows on the right: the drawn popcorn cart, or an uploaded photo.
export const HERO_VISUALS = {
  drawing: 'drawing',
  photo: 'photo',
} as const

export type HeroVisual = (typeof HERO_VISUALS)[keyof typeof HERO_VISUALS]

const heroBaseSchema = z.object({
  headline: requiredText(LIMITS.heroHeadline, 'Enter a headline').refine(
    (headline) => headlineLineCount(headline) <= LIMITS.heroHeadlineMaxLines,
    `Use at most ${LIMITS.heroHeadlineMaxLines} lines`,
  ),
  description: requiredText(LIMITS.heroDescription, 'Enter a short description'),
  primaryCtaLabel: requiredText(LIMITS.label, 'Enter the button text'),
  secondaryCtaLabel: requiredText(LIMITS.label, 'Enter the button text'),
  highlights: listSchema(textRow(LIMITS.highlight, 'Enter the highlight or remove it'), {
    min: 0,
    max: LIMITS.heroMaxHighlights,
    noun: 'highlight',
  }),
  visual: z.enum([HERO_VISUALS.drawing, HERO_VISUALS.photo]),
  image: imageSchema.nullable(),
})

export const heroSchema = heroBaseSchema.superRefine((values, context) => {
  if (values.visual === HERO_VISUALS.photo && !values.image) {
    context.addIssue({ code: 'custom', path: ['image'], message: 'Upload a photo, or choose the drawn cart' })
  }
})

export const eventTypesSchema = z.object({
  items: listSchema(textRow(LIMITS.label, 'Enter the event type or remove it'), {
    min: 1,
    max: LIMITS.eventTypesMaxItems,
    noun: 'event type',
  }),
})

export const packagesMenuSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  description: requiredText(LIMITS.shortText, 'Enter a description'),
})

export const howItWorksSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  steps: listSchema(
    z.object({
      title: requiredText(LIMITS.heading, 'Enter the step title'),
      body: requiredText(LIMITS.shortText, 'Describe the step'),
    }),
    { min: 1, max: LIMITS.stepsMaxItems, noun: 'step' },
  ),
  ctaLabel: requiredText(LIMITS.label, 'Enter the button text'),
})

const flavorColorValues = Object.values(FLAVOR_COLORS) as [
  (typeof FLAVOR_COLORS)[keyof typeof FLAVOR_COLORS],
  ...(typeof FLAVOR_COLORS)[keyof typeof FLAVOR_COLORS][],
]

export const flavorsSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  description: requiredText(LIMITS.shortText, 'Enter a description'),
  items: listSchema(
    z.object({
      name: requiredText(LIMITS.label, 'Enter the flavor name'),
      color: z.enum(flavorColorValues),
    }),
    { min: 1, max: LIMITS.flavorsMaxItems, noun: 'flavor' },
  ),
})

export const faqSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  intro: optionalText(LIMITS.faqIntro),
  items: listSchema(
    z.object({
      question: requiredText(LIMITS.faqQuestion, 'Enter the question'),
      answer: requiredText(LIMITS.faqAnswer, 'Enter the answer'),
    }),
    { min: 1, max: LIMITS.faqMaxItems, noun: 'question' },
  ),
})

export const bookingSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  description: requiredText(LIMITS.shortText, 'Enter a description'),
  phonePrompt: requiredText(LIMITS.heading, 'Enter the text above the phone number'),
})

export const storySchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  body: requiredText(LIMITS.storyBody, 'Write your story'),
  image: imageSchema.nullable(),
  imageSide: z.enum([IMAGE_SIDES.left, IMAGE_SIDES.right]),
})

// Gallery rows hold an image that may not be uploaded yet.
export const gallerySchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  intro: optionalText(LIMITS.shortText),
  images: listSchema(
    z.object({
      // Boolean(), not a type guard, so the form value keeps allowing an empty row while editing.
      image: imageSchema.nullable().refine((image) => Boolean(image), 'Upload a photo or remove this row'),
      caption: optionalText(LIMITS.imageCaption),
    }),
    { min: 0, max: LIMITS.galleryMaxImages, noun: 'photo' },
  ),
})

export const textSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  body: requiredText(LIMITS.textBody, 'Write something'),
})

export const ctaSchema = z
  .object({
    heading: requiredText(LIMITS.heading, 'Enter a heading'),
    body: optionalText(LIMITS.ctaBody),
    buttonLabel: requiredText(LIMITS.label, 'Enter the button text'),
    buttonTarget: z.enum([CTA_TARGETS.book, CTA_TARGETS.url]),
    buttonUrl: z.string().trim().max(LIMITS.url),
  })
  .superRefine((values, context) => {
    if (values.buttonTarget !== CTA_TARGETS.url) return
    if (!HTTPS_URL_PATTERN.test(values.buttonUrl)) {
      context.addIssue({ code: 'custom', path: ['buttonUrl'], message: 'Enter a full link starting with https://' })
    }
  })

export type HeroFormValues = z.infer<typeof heroSchema>
export type StoryFormValues = z.infer<typeof storySchema>
export type GalleryFormValues = z.infer<typeof gallerySchema>
export type CtaFormValues = z.infer<typeof ctaSchema>
export type EventTypesFormValues = z.infer<typeof eventTypesSchema>

const toRows = (items: readonly string[]) => items.map((value) => ({ value }))
const fromRows = (rows: readonly { value: string }[]) => rows.map((row) => row.value)

export const heroForm = {
  toValues: (content: HeroContent): HeroFormValues => ({
    ...content,
    highlights: toRows(content.highlights),
    visual: content.image ? HERO_VISUALS.photo : HERO_VISUALS.drawing,
  }),
  toContent: ({ visual, ...values }: HeroFormValues): HeroContent => ({
    ...values,
    highlights: fromRows(values.highlights),
    image: visual === HERO_VISUALS.photo ? values.image : null,
  }),
}

export const storyForm = {
  toValues: (content: StoryContent): StoryFormValues => content,
  toContent: (values: StoryFormValues): StoryContent => values,
}

export const galleryForm = {
  toValues: (content: GalleryContent): GalleryFormValues => ({
    ...content,
    images: content.images.map(({ caption, ...image }) => ({ image, caption })),
  }),
  // Rows without an upload yet are left out of the draft (saving is blocked until they're filled).
  toContent: (values: GalleryFormValues): GalleryContent => ({
    ...values,
    images: values.images.flatMap(({ image, caption }) => (image ? [{ ...image, caption }] : [])),
  }),
}

export const ctaForm = {
  toValues: (content: CtaContent): CtaFormValues => ({ ...content, buttonUrl: content.buttonUrl ?? '' }),
  toContent: (values: CtaFormValues): CtaContent => ({
    ...values,
    buttonUrl: values.buttonTarget === CTA_TARGETS.url ? values.buttonUrl : null,
  }),
}

export const eventTypesForm = {
  toValues: (content: EventTypesContent): EventTypesFormValues => ({ items: toRows(content.items) }),
  toContent: (values: EventTypesFormValues): EventTypesContent => ({ items: fromRows(values.items) }),
}
