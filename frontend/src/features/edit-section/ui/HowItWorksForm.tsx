import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, type HowItWorksContent } from '@/entities/site'

import { howItWorksSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, ListEditor, TextField } from './parts'

const STEP_BODY_ROWS = 2

export function HowItWorksForm({ content, onSave, status, onClose }: SectionFormProps<HowItWorksContent>) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HowItWorksContent>({ resolver: zodResolver(howItWorksSchema), defaultValues: content })
  const steps = useFieldArray({ control, name: 'steps' })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
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
