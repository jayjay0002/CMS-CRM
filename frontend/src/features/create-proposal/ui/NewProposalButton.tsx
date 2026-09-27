import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  BOOKING_SEARCH_MAX_LENGTH,
  BOOKING_STATUSES,
  BOOKING_TIMEFRAMES,
  type BookingFilters,
  type BookingListItem,
  type BookingStatus,
  BookingStatusBadge,
  formatEventDate,
  useAdminBookings,
} from '@/entities/booking'
import { saveErrorMessage } from '@/shared/api'
import { adminProposalPath } from '@/shared/config'
import { buttonClasses, FormMessage, LIST_ACTION_BUTTON, SearchField } from '@/shared/ui'

import { useCreateProposalForBooking } from '../model/mutations'

// Proposals can only be sent while a booking is still open (the server enforces this too).
const PROPOSAL_READY_STATUSES: readonly BookingStatus[] = [BOOKING_STATUSES.pending, BOOKING_STATUSES.approved]
const FIRST_PAGE = 1

function canHaveProposal(booking: BookingListItem): boolean {
  return PROPOSAL_READY_STATUSES.includes(booking.status)
}

type PickerProps = {
  onPick: (booking: BookingListItem) => void
  pickingBookingId: number | null
}

function BookingPicker({ onPick, pickingBookingId }: PickerProps) {
  const searchId = useId()
  const [search, setSearch] = useState('')
  // Newest bookings first; the search narrows by reference or customer name.
  const filters: BookingFilters = { timeframe: BOOKING_TIMEFRAMES.all, status: null, search, page: FIRST_PAGE }
  const bookings = useAdminBookings(filters)

  function renderResults() {
    if (bookings.isPending) return <p role="status" className="py-4 text-ink/70">Loading bookings…</p>
    if (bookings.isError) {
      return (
        <div role="alert" className="space-y-2 py-2">
          <p className="font-semibold">We couldn’t load bookings.</p>
          <button type="button" onClick={() => bookings.refetch()} className={LIST_ACTION_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    if (bookings.data.items.length === 0) {
      return <p className="py-4 text-ink/70">{search ? `No bookings match “${search}”.` : 'No bookings yet.'}</p>
    }
    return (
      <ul className="divide-y divide-ink/15" aria-label="Bookings">
        {bookings.data.items.map((booking) => {
          const isReady = canHaveProposal(booking)
          return (
            <li key={booking.id}>
              <button
                type="button"
                disabled={!isReady || pickingBookingId !== null}
                onClick={() => onPick(booking)}
                className="flex w-full items-start justify-between gap-3 px-2 py-3 text-left hover:bg-butter-soft/60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <span className="min-w-0">
                  <span className={`block font-bold ${isReady ? '' : 'text-ink/50'}`}>{booking.customer_name}</span>
                  <span className="block text-sm text-ink/70">
                    <span className="font-mono">{booking.reference}</span>, {formatEventDate(booking.event_date)}
                  </span>
                  {!isReady && (
                    <span className="block text-sm text-ink/60">Proposals are only for pending or approved bookings.</span>
                  )}
                  {pickingBookingId === booking.id && (
                    <span role="status" className="block text-sm font-semibold">Creating draft…</span>
                  )}
                </span>
                <BookingStatusBadge status={booking.status} />
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="space-y-3">
      <SearchField
        id={searchId}
        label="Search bookings by reference or customer name"
        placeholder="Search reference or name"
        maxLength={BOOKING_SEARCH_MAX_LENGTH}
        appliedSearch={search}
        onSearch={(value) => setSearch(value.trim())}
      />
      <div className={`max-h-80 overflow-y-auto ${bookings.isPlaceholderData ? 'opacity-60' : ''}`}>
        {renderResults()}
      </div>
    </div>
  )
}

// "New proposal": pick the booking, then land in the editor with a fresh draft.
export function NewProposalButton() {
  const navigate = useNavigate()
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const create = useCreateProposalForBooking()

  function open() {
    create.reset()
    setIsOpen(true)
    // showModal() traps focus inside the dialog and closes it on Esc.
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  function pick(booking: BookingListItem) {
    create.mutate(booking.id, {
      onSuccess: (draft) => {
        close()
        navigate(adminProposalPath(draft.id))
      },
    })
  }

  return (
    <>
      <button type="button" onClick={open} className={buttonClasses('primary', 'px-5 py-2.5')}>
        New proposal
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-3xl border-4 border-ink bg-kernel p-0 text-ink shadow-sign-lg backdrop:bg-ink/50"
      >
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-display text-2xl">
                New proposal
              </h2>
              <p className="text-ink/75">Choose the booking this proposal is for.</p>
            </div>
            <button type="button" onClick={close} className={LIST_ACTION_BUTTON}>
              Close
            </button>
          </div>
          {/* Mounted only while open, so the booking search runs on demand. */}
          {isOpen && (
            <BookingPicker onPick={pick} pickingBookingId={create.isPending ? (create.variables ?? null) : null} />
          )}
          {create.isError && <FormMessage tone="error">{saveErrorMessage(create.error)}</FormMessage>}
        </div>
      </dialog>
    </>
  )
}
