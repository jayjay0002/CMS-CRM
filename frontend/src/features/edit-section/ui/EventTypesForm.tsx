import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, type EventTypesContent } from '@/entities/site'

import { eventTypesForm, type EventTypesFormValues, eventTypesSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, ListEditor, TextField } from './parts'

export function EventTypesForm({ content, onSave, status, onClose }: SectionFormProps<EventTypesContent>) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EventTypesFormValues>({
    resolver: zodResolver(eventTypesSchema),
    defaultValues: eventTypesForm.toValues(content),
  })
  const items = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit((values) => onSave(eventTypesForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
      <ListEditor
        legend="Event types"
        itemNoun="event type"
        itemKeys={items.fields.map((field) => field.id)}
        minItems={1}
        maxItems={CONTENT_LIMITS.eventTypesMaxItems}
        onAdd={() => items.append({ value: '' })}
        onMove={items.move}
        onRemove={items.remove}
        error={errors.items?.root?.message ?? errors.items?.message}
        renderItem={(index) => (
          <TextField
            id={`event-type-${index}`}
            label="Name"
            registration={register(`items.${index}.value`)}
            error={errors.items?.[index]?.value?.message}
          />
        )}
      />
    </EditorShell>
  )
}
