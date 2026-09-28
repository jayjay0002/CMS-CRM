import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'

import { usePackages } from '@/entities/package'
import { ApiError } from '@/shared/api'
import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { MAX_GUEST_COUNT, MIN_GUEST_COUNT, START_TIME_STEP_SECONDS } from '../config/constants'
import { toCreateBookingPayload } from '../lib/toCreateBookingPayload'
import { type BookingFormValues, bookingFormSchema, getEventDateBounds } from '../model/schema'
import { useCreateBooking } from '../model/useCreateBooking'
import { BookingConfirmation } from './BookingConfirmation'
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

  const dateBounds = getEventDateBounds()

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <PackagePicker
        contactPhone={contactPhone}
        packagesQuery={packagesQuery}
        fieldId={idFor('packageSlug')}
        registration={register('packageSlug')}
        error={errors.packageSlug?.message}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event date" htmlFor={idFor('eventDate')} error={errors.eventDate?.message}>
          <input
            id={idFor('eventDate')}
            type="date"
            min={dateBounds.min}
            max={dateBounds.max}
            className={INPUT_CLASSES}
            {...fieldAria(idFor('eventDate'), errors.eventDate?.message)}
            {...register('eventDate')}
          />
        </Field>
        <Field label="Start time" htmlFor={idFor('eventStartTime')} error={errors.eventStartTime?.message}>
          <input
            id={idFor('eventStartTime')}
            type="time"
            step={START_TIME_STEP_SECONDS}
            className={INPUT_CLASSES}
            {...fieldAria(idFor('eventStartTime'), errors.eventStartTime?.message)}
            {...register('eventStartTime')}
          />
        </Field>
        <Field label="Venue address" htmlFor={idFor('venueAddress')} error={errors.venueAddress?.message} className="sm:col-span-2">
          <input
            id={idFor('venueAddress')}
            autoComplete="street-address"
            placeholder="123 Peachtree St NE, Atlanta, GA"
            className={INPUT_CLASSES}
            {...fieldAria(idFor('venueAddress'), errors.venueAddress?.message)}
            {...register('venueAddress')}
          />
        </Field>
        <Field label="Number of guests" htmlFor={idFor('guestCount')} error={errors.guestCount?.message}>
          <input
            id={idFor('guestCount')}
            type="number"
            inputMode="numeric"
            min={MIN_GUEST_COUNT}
            max={MAX_GUEST_COUNT}
            className={INPUT_CLASSES}
            {...fieldAria(idFor('guestCount'), errors.guestCount?.message)}
            {...register('guestCount', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Your name" htmlFor={idFor('customerName')} error={errors.customerName?.message}>
          <input
            id={idFor('customerName')}
            autoComplete="name"
            className={INPUT_CLASSES}
            {...fieldAria(idFor('customerName'), errors.customerName?.message)}
            {...register('customerName')}
          />
        </Field>
        <Field label="Phone" htmlFor={idFor('customerPhone')} error={errors.customerPhone?.message}>
          <input
            id={idFor('customerPhone')}
            type="tel"
            autoComplete="tel"
            className={INPUT_CLASSES}
            {...fieldAria(idFor('customerPhone'), errors.customerPhone?.message)}
            {...register('customerPhone')}
          />
        </Field>
        <Field label="Email" htmlFor={idFor('customerEmail')} error={errors.customerEmail?.message}>
          <input
            id={idFor('customerEmail')}
            type="email"
            autoComplete="email"
            className={INPUT_CLASSES}
            {...fieldAria(idFor('customerEmail'), errors.customerEmail?.message)}
            {...register('customerEmail')}
          />
        </Field>
        <Field
          label="Anything we should know? (optional)"
          htmlFor={idFor('customerNotes')}
          error={errors.customerNotes?.message}
          className="sm:col-span-2"
        >
          <textarea
            id={idFor('customerNotes')}
            rows={3}
            placeholder="Flavors you'd like, allergies, where the cart should go"
            className={INPUT_CLASSES}
            {...fieldAria(idFor('customerNotes'), errors.customerNotes?.message)}
            {...register('customerNotes')}
          />
        </Field>
      </div>

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
