import { type FormEvent, useState } from 'react'

import { ADMIN_NOTES_MAX_LENGTH, type BookingDetail } from '@/entities/booking'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { useUpdateBookingNotes } from '../model/useUpdateBookingNotes'

const NOTES_FIELD_ID = 'admin-notes'
const COUNTER_ID = 'admin-notes-counter'
const NOTES_ROWS = 5

type Props = {
  booking: BookingDetail
}

export function AdminNotesForm({ booking }: Props) {
  const saved = booking.admin_notes ?? ''
  const [notes, setNotes] = useState(saved)
  const updateNotes = useUpdateBookingNotes(booking.id)
  const isDirty = notes.trim() !== saved
  const remaining = ADMIN_NOTES_MAX_LENGTH - notes.length

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateNotes.mutate(notes, { onSuccess: (updated) => setNotes(updated.admin_notes ?? '') })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor={NOTES_FIELD_ID} className="block font-semibold">
        Private notes <span className="font-normal text-ink/70">(customers never see these)</span>
      </label>
      <textarea
        id={NOTES_FIELD_ID}
        rows={NOTES_ROWS}
        maxLength={ADMIN_NOTES_MAX_LENGTH}
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value)
          updateNotes.reset()
        }}
        aria-describedby={COUNTER_ID}
        placeholder="Parking info, flavor choices, who you spoke with…"
        className={INPUT_CLASSES}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={!isDirty || updateNotes.isPending}
          className={buttonClasses('primary', 'px-5 py-2.5')}
        >
          {updateNotes.isPending ? 'Saving…' : 'Save notes'}
        </button>
        <p id={COUNTER_ID} className="text-sm text-ink/60">
          {remaining.toLocaleString('en-US')} characters left
        </p>
      </div>
      {updateNotes.isError && <FormMessage tone="error">{saveErrorMessage(updateNotes.error)}</FormMessage>}
      {updateNotes.isSuccess && !isDirty && <FormMessage tone="success">Saved.</FormMessage>}
    </form>
  )
}
