import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { usePackages } from '@/entities/package'
import type { BookingContent, PackagesMenuContent } from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell, Field, INPUT_CLASSES } from '@/shared/ui'

import { bookingSchema, packagesMenuSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { TextField } from './parts'

const DESCRIPTION_ROWS = 3

// The form values already are the content.
const asPackagesMenu = (values: PackagesMenuContent): PackagesMenuContent => values
const asBooking = (values: BookingContent): BookingContent => values

export function PackagesMenuForm({
  content,
  onSave,
  status,
  onDraftChange,
  onDirtyChange,
}: SectionFormProps<PackagesMenuContent>) {
  const form = useForm<PackagesMenuContent>({ resolver: zodResolver(packagesMenuSchema), defaultValues: content })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  useDraftReporting({ form, toDraft: asPackagesMenu, onDraftChange, onDirtyChange })
  const { data: packages = [] } = usePackages()

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="packages-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="packages-description"
        label="Description"
        hint="The packages themselves are managed separately."
        rows={DESCRIPTION_ROWS}
        registration={register('description')}
        error={errors.description?.message}
      />
      <Field label="Most popular package" htmlFor="packages-featured">
        <select
          id="packages-featured"
          className={INPUT_CLASSES}
          // The "none" option's empty value is stored as null.
          {...register('featuredPackageSlug', { setValueAs: (value: string | null) => value || null })}
        >
          <option value="">None</option>
          {packages.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name}
            </option>
          ))}
        </select>
      </Field>
    </EditorShell>
  )
}

export function BookingSectionForm({
  content,
  onSave,
  status,
  onDraftChange,
  onDirtyChange,
}: SectionFormProps<BookingContent>) {
  const form = useForm<BookingContent>({ resolver: zodResolver(bookingSchema), defaultValues: content })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  useDraftReporting({ form, toDraft: asBooking, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
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
