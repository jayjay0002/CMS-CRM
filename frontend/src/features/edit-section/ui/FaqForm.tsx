import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, type FaqContent } from '@/entities/site'

import { faqSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, ListEditor, TextField } from './parts'

const INTRO_ROWS = 2
const ANSWER_ROWS = 3

export function FaqForm({ content, onSave, status, onClose }: SectionFormProps<FaqContent>) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FaqContent>({ resolver: zodResolver(faqSchema), defaultValues: content })
  const items = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
      <TextField id="faq-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="faq-intro"
        label="Intro (optional)"
        hint="Shown above your phone number, next to the questions."
        rows={INTRO_ROWS}
        registration={register('intro')}
        error={errors.intro?.message}
      />
      <ListEditor
        legend="Questions"
        itemNoun="question"
        itemKeys={items.fields.map((field) => field.id)}
        minItems={1}
        maxItems={CONTENT_LIMITS.faqMaxItems}
        onAdd={() => items.append({ question: '', answer: '' })}
        onMove={items.move}
        onRemove={items.remove}
        error={errors.items?.root?.message ?? errors.items?.message}
        renderItem={(index) => (
          <>
            <TextField
              id={`faq-${index}-question`}
              label="Question"
              registration={register(`items.${index}.question`)}
              error={errors.items?.[index]?.question?.message}
            />
            <TextField
              id={`faq-${index}-answer`}
              label="Answer"
              rows={ANSWER_ROWS}
              registration={register(`items.${index}.answer`)}
              error={errors.items?.[index]?.answer?.message}
            />
          </>
        )}
      />
    </EditorShell>
  )
}
