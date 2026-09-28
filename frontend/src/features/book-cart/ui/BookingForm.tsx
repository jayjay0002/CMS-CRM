import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'

import { usePackages } from '@/entities/package'
import { ApiError } from '@/shared/api'
import { buttonClasses, FormMessage } from '@/shared/ui'

import { toCreateBookingPayload } from '../lib/toCreateBookingPayload'
import { type BookingFormValues, bookingFormSchema } from '../model/schema'
import { useCreateBooking } from '../model/useCreateBooking'
import { BookingConfirmation } from './BookingConfirmation'
import { ContactStep, EventStep, LocationStep } from './BookingSteps'
import { PackagePicker } from './PackagePicker'

const EMPTY_FORM: BookingFormValues = {
  packageSlug: '',
  eventDate: '',
  eventStartTime: '',
  venueAddress: '',
  guestCount: Number.NaN,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerNotes: '',
  website: '',
}

function submitErrorMessage(error: Error, contactPhone: string): string {
  // Domain errors (e.g. a date outside the booking window) carry a sentence meant for people.
  if (error instanceof ApiError && error.detail) return error.detail
  return `We couldn't send your request. Try again, or call us at ${contactPhone}.`
}

function submitLabel(isPending: boolean, isPreview: boolean): string {
  if (isPreview) return 'Booking is off in the preview'
  return isPending ? 'Sending…' : 'Send booking request'
}

type Props = {
  selectedPackageSlug: string | null
  // Shown in error messages so customers can still reach the business.
  contactPhone: string
  // In the admin preview the form is shown but can't send real bookings.
  isPreview?: boolean
}

export function BookingForm({ selectedPackageSlug, contactPhone, isPreview = false }: Props) {
  // The form can be on the page and in the booking dialog at once, so its ids must be unique.
  const formId = useId()
  const idFor = (fieldName: keyof BookingFormValues) => `${formId}${fieldName}`
  const packagesQuery = usePackages()
  const createBooking = useCreateBooking()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: EMPTY_FORM,
  })

  useEffect(() => {
    if (selectedPackageSlug) {
      setValue('packageSlug', selectedPackageSlug, { shouldValidate: true })
    }
  }, [selectedPackageSlug, setValue])

  const onSubmit = handleSubmit((values) => {
    if (isPreview) return
    createBooking.mutate(toCreateBookingPayload(values))
  })

  function startOver() {
    createBooking.reset()
    reset(EMPTY_FORM)
  }

  if (createBooking.isSuccess) {
    return (
      <BookingConfirmation
        reference={createBooking.data.reference}
        packageName={createBooking.data.package_name}
        eventDate={createBooking.data.event_date}
        onStartOver={startOver}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <PackagePicker
        contactPhone={contactPhone}
        packagesQuery={packagesQuery}
        fieldId={idFor('packageSlug')}
        registration={register('packageSlug')}
        error={errors.packageSlug?.message}
      />

      <EventStep register={register} errors={errors} idFor={idFor} />
      <LocationStep register={register} errors={errors} idFor={idFor} />
      <ContactStep register={register} errors={errors} idFor={idFor} />

      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor={idFor('website')}>Leave this empty</label>
        <input id={idFor('website')} tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {createBooking.isError && (
        <FormMessage tone="error">{submitErrorMessage(createBooking.error, contactPhone)}</FormMessage>
      )}

      <button
        type="submit"
        disabled={createBooking.isPending || isPreview}
        className={buttonClasses('primary', 'w-full py-4 text-lg')}
      >
        {submitLabel(createBooking.isPending, isPreview)}
      </button>
      <p className="text-center text-sm text-ink/70">Nothing is charged until we confirm your date.</p>
    </form>
  )
}
