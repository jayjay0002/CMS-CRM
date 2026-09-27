import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, type HeroContent } from '@/entities/site'

import { heroForm, type HeroFormValues, heroSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, ListEditor, TextField } from './parts'

const HEADLINE_ROWS = 3
const DESCRIPTION_ROWS = 3

export function HeroForm({ content, onSave, status, onClose }: SectionFormProps<HeroContent>) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HeroFormValues>({ resolver: zodResolver(heroSchema), defaultValues: heroForm.toValues(content) })
  const highlights = useFieldArray({ control, name: 'highlights' })

  const onSubmit = handleSubmit((values) => onSave(heroForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
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
      <div className="grid gap-5 sm:grid-cols-2">
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
