import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { CONTENT_LIMITS, FLAVOR_COLOR_OPTIONS, FLAVOR_COLORS, type FlavorsContent } from '@/entities/site'
import { Field, INPUT_CLASSES } from '@/shared/ui'

import { flavorsSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, ListEditor, TextField } from './parts'

const DESCRIPTION_ROWS = 3
const COLOR_ENTRIES = Object.entries(FLAVOR_COLOR_OPTIONS)

export function FlavorsForm({ content, onSave, status, onClose }: SectionFormProps<FlavorsContent>) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FlavorsContent>({ resolver: zodResolver(flavorsSchema), defaultValues: content })
  const items = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
      <TextField id="flavors-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="flavors-description"
        label="Description"
        rows={DESCRIPTION_ROWS}
        registration={register('description')}
        error={errors.description?.message}
      />
      <ListEditor
        legend="Flavors"
        itemNoun="flavor"
        itemKeys={items.fields.map((field) => field.id)}
        minItems={1}
        maxItems={CONTENT_LIMITS.flavorsMaxItems}
        onAdd={() => items.append({ name: '', color: FLAVOR_COLORS.butter })}
        onMove={items.move}
        onRemove={items.remove}
        error={errors.items?.root?.message ?? errors.items?.message}
        renderItem={(index) => (
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <TextField
              id={`flavor-${index}-name`}
              label="Name"
              registration={register(`items.${index}.name`)}
              error={errors.items?.[index]?.name?.message}
            />
            <Field label="Color" htmlFor={`flavor-${index}-color`}>
              <select id={`flavor-${index}-color`} className={INPUT_CLASSES} {...register(`items.${index}.color`)}>
                {COLOR_ENTRIES.map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
      />
    </EditorShell>
  )
}
