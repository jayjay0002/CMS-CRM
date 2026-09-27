import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, type HowItWorksContent } from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell } from '@/shared/ui'

import { howItWorksSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { ListEditor, TextField } from './parts'

const STEP_BODY_ROWS = 2

// The form values already are the content.
const asContent = (values: HowItWorksContent): HowItWorksContent => values

export function HowItWorksForm({
  content,
  onSave,
  status,
  onDraftChange,
  onDirtyChange,
}: SectionFormProps<HowItWorksContent>) {
  const form = useForm<HowItWorksContent>({ resolver: zodResolver(howItWorksSchema), defaultValues: content })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const steps = useFieldArray({ control, name: 'steps' })
  useDraftReporting({ form, toDraft: asContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="steps-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <ListEditor
        legend="Steps (numbered in this order)"
        itemNoun="step"
        itemKeys={steps.fields.map((field) => field.id)}
        minItems={1}
        maxItems={CONTENT_LIMITS.stepsMaxItems}
        onAdd={() => steps.append({ title: '', body: '' })}
        onMove={steps.move}
        onRemove={steps.remove}
        error={errors.steps?.root?.message ?? errors.steps?.message}
        renderItem={(index) => (
          <>
            <TextField
              id={`step-${index}-title`}
              label="Title"
              registration={register(`steps.${index}.title`)}
              error={errors.steps?.[index]?.title?.message}
            />
            <TextField
              id={`step-${index}-body`}
              label="Description"
              rows={STEP_BODY_ROWS}
              registration={register(`steps.${index}.body`)}
              error={errors.steps?.[index]?.body?.message}
            />
          </>
        )}
      />
      <TextField
        id="steps-cta"
        label="Button text under the steps"
        registration={register('ctaLabel')}
        error={errors.ctaLabel?.message}
      />
    </EditorShell>
  )
}
