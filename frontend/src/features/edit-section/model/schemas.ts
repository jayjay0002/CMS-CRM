import { z } from 'zod'

import {
  CONTENT_LIMITS as LIMITS,
  type EventTypesContent,
  FLAVOR_COLORS,
  type HeroContent,
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

export const heroSchema = z.object({
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

export type HeroFormValues = z.infer<typeof heroSchema>
export type EventTypesFormValues = z.infer<typeof eventTypesSchema>

const toRows = (items: readonly string[]) => items.map((value) => ({ value }))
const fromRows = (rows: readonly { value: string }[]) => rows.map((row) => row.value)

export const heroForm = {
  toValues: (content: HeroContent): HeroFormValues => ({ ...content, highlights: toRows(content.highlights) }),
  toContent: (values: HeroFormValues): HeroContent => ({ ...values, highlights: fromRows(values.highlights) }),
}

export const eventTypesForm = {
  toValues: (content: EventTypesContent): EventTypesFormValues => ({ items: toRows(content.items) }),
  toContent: (values: EventTypesFormValues): EventTypesContent => ({ items: fromRows(values.items) }),
}
