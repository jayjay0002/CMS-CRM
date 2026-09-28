import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { Field, fieldAria, INPUT_CLASSES } from '@/shared/ui'

import { BOOKING_STEPS, MAX_GUEST_COUNT, MIN_GUEST_COUNT, START_TIME_STEP_SECONDS } from '../config/constants'
import { type BookingFormValues, getEventDateBounds } from '../model/schema'
import { StepLegend } from './StepLegend'

type StepProps = {
  register: UseFormRegister<BookingFormValues>
  errors: FieldErrors<BookingFormValues>
  // The form can be on the page and in the booking dialog at once, so its ids must be unique.
  idFor: (fieldName: keyof BookingFormValues) => string
}

// grid-cols-1 (not the implicit auto column) so a wide field can never stretch the form past the screen.
const FIELD_GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2'

export function EventStep({ register, errors, idFor }: StepProps) {
  const dateBounds = getEventDateBounds()

  return (
    <fieldset>
      <StepLegend step={BOOKING_STEPS.event} />
      {/* Date, time and head count fit on one row once there is room; the date needs the most. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.25fr_1fr_1fr]">
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
        <Field label="Guest count" htmlFor={idFor('guestCount')} error={errors.guestCount?.message}>
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
      </div>
    </fieldset>
  )
}

export function LocationStep({ register, errors, idFor }: StepProps) {
  return (
    <fieldset>
      <StepLegend step={BOOKING_STEPS.location} />
      <Field label="Venue address" htmlFor={idFor('venueAddress')} error={errors.venueAddress?.message}>
        <input
          id={idFor('venueAddress')}
          autoComplete="street-address"
          placeholder="123 Peachtree St NE, Atlanta, GA"
          className={INPUT_CLASSES}
          {...fieldAria(idFor('venueAddress'), errors.venueAddress?.message)}
          {...register('venueAddress')}
        />
      </Field>
    </fieldset>
  )
}

export function ContactStep({ register, errors, idFor }: StepProps) {
  return (
    <fieldset>
      <StepLegend step={BOOKING_STEPS.contact} />
      <div className={FIELD_GRID}>
        <Field label="Your name" htmlFor={idFor('customerName')} error={errors.customerName?.message} className="sm:col-span-2">
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
    </fieldset>
  )
}
