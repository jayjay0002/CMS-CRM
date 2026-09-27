import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { BookingContent, PackagesMenuContent } from '@/entities/site'

import { bookingSchema, packagesMenuSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { EditorShell, TextField } from './parts'

const DESCRIPTION_ROWS = 3

export function PackagesMenuForm({ content, onSave, status, onClose }: SectionFormProps<PackagesMenuContent>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PackagesMenuContent>({ resolver: zodResolver(packagesMenuSchema), defaultValues: content })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
      <TextField id="packages-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="packages-description"
        label="Description"
        hint="The packages themselves are managed separately."
        rows={DESCRIPTION_ROWS}
        registration={register('description')}
        error={errors.description?.message}
      />
    </EditorShell>
  )
}

export function BookingSectionForm({ content, onSave, status, onClose }: SectionFormProps<BookingContent>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BookingContent>({ resolver: zodResolver(bookingSchema), defaultValues: content })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onClose={onClose} status={status} isSaved={status.isSuccess && !isDirty}>
      <TextField id="booking-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="booking-description"
        label="Description"
        rows={DESCRIPTION_ROWS}
        registration={register('description')}
        error={errors.description?.message}
      />
      <TextField
        id="booking-phone-prompt"
        label="Text above the phone number"
        registration={register('phonePrompt')}
        error={errors.phonePrompt?.message}
      />
    </EditorShell>
  )
}
