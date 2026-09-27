import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import { ImageUploadField } from '@/entities/media'
import { CONTENT_LIMITS, type HeroContent } from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell } from '@/shared/ui'

import { HERO_VISUALS, heroForm, type HeroFormValues, heroSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { ChoiceGroup } from './ChoiceGroup'
import { ListEditor, TextField } from './parts'

const HEADLINE_ROWS = 3
const DESCRIPTION_ROWS = 3

const VISUAL_OPTIONS = [
  { value: HERO_VISUALS.drawing, label: 'Drawn popcorn cart', description: 'The illustrated cart (default).' },
  { value: HERO_VISUALS.photo, label: 'Your photo', description: 'A real photo of your cart or an event.' },
] as const

export function HeroForm({ content, onSave, status, onDraftChange, onDirtyChange }: SectionFormProps<HeroContent>) {
  const form = useForm<HeroFormValues>({ resolver: zodResolver(heroSchema), defaultValues: heroForm.toValues(content) })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const highlights = useFieldArray({ control, name: 'highlights' })
  const visual = useWatch({ control, name: 'visual' })
  useDraftReporting({ form, toDraft: heroForm.toContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(heroForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField
        id="hero-headline"
        label="Headline"
        hint={`Press Enter to start a new line (up to ${CONTENT_LIMITS.heroHeadlineMaxLines} lines).`}
        rows={HEADLINE_ROWS}
        registration={register('headline')}
        error={errors.headline?.message}
      />
      <TextField
        id="hero-description"
        label="Description"
        rows={DESCRIPTION_ROWS}
        registration={register('description')}
        error={errors.description?.message}
      />
      <div className="grid gap-5 @lg:grid-cols-2">
        <TextField
          id="hero-primary-cta"
          label="Main button text"
          registration={register('primaryCtaLabel')}
          error={errors.primaryCtaLabel?.message}
        />
        <TextField
          id="hero-secondary-cta"
          label="“See packages” button text"
          registration={register('secondaryCtaLabel')}
          error={errors.secondaryCtaLabel?.message}
        />
      </div>
      <ChoiceGroup id="hero-visual" legend="Picture on the right" options={VISUAL_OPTIONS} registration={register('visual')} />
      {visual === HERO_VISUALS.photo && (
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <ImageUploadField
              id="hero-image"
              label="Hero photo"
              hint="A tall or square photo works best."
              image={field.value}
              onChange={field.onChange}
              altMaxLength={CONTENT_LIMITS.imageAlt}
              altError={errors.image?.alt?.message ?? fieldState.error?.message}
            />
          )}
        />
      )}
      <ListEditor
        legend="Highlights under the buttons"
        itemNoun="highlight"
        itemKeys={highlights.fields.map((field) => field.id)}
        minItems={0}
        maxItems={CONTENT_LIMITS.heroMaxHighlights}
        onAdd={() => highlights.append({ value: '' })}
        onMove={highlights.move}
        onRemove={highlights.remove}
        error={errors.highlights?.root?.message ?? errors.highlights?.message}
        renderItem={(index) => (
          <TextField
            id={`hero-highlight-${index}`}
            label="Text"
            registration={register(`highlights.${index}.value`)}
            error={errors.highlights?.[index]?.value?.message}
          />
        )}
      />
    </EditorShell>
  )
}
