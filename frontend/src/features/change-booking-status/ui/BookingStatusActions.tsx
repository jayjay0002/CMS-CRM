import { useState } from 'react'

import { BOOKING_STATUS_LABELS, type BookingDetail, type BookingStatus } from '@/entities/booking'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, FormMessage } from '@/shared/ui'

import { STATUS_ACTIONS } from '../config/actions'
import { useChangeBookingStatus } from '../model/useChangeBookingStatus'

const NEUTRAL_BUTTON =
  'rounded-full border-2 border-ink bg-white px-5 py-2.5 font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-50'
const DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-white px-5 py-2.5 font-semibold text-cherry-deep hover:bg-cherry/10 disabled:cursor-not-allowed disabled:opacity-50'
const CONFIRM_DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-cherry px-5 py-2.5 font-semibold text-kernel hover:bg-cherry-deep disabled:opacity-50'

function actionClasses(tone: (typeof STATUS_ACTIONS)[BookingStatus]['tone']): string {
  if (tone === 'primary') return buttonClasses('primary', 'px-5 py-2.5')
  return tone === 'danger' ? DANGER_BUTTON : NEUTRAL_BUTTON
}

type Props = {
  booking: BookingDetail
}

export function BookingStatusActions({ booking }: Props) {
  const changeStatus = useChangeBookingStatus(booking.id)
  const [confirming, setConfirming] = useState<BookingStatus | null>(null)
  const [changedTo, setChangedTo] = useState<BookingStatus | null>(null)

  function apply(status: BookingStatus) {
    setChangedTo(null)
    changeStatus.mutate(status, {
      onSuccess: () => setChangedTo(status),
      onSettled: () => setConfirming(null),
    })
  }

  function choose(status: BookingStatus) {
    if (STATUS_ACTIONS[status].confirm) {
      setConfirming(status)
      return
    }
    apply(status)
  }

  if (booking.allowed_next_statuses.length === 0) {
    return (
      <p className="text-ink/75">
        This booking is {BOOKING_STATUS_LABELS[booking.status].toLowerCase()}. Its status can’t change
        anymore.
      </p>
    )
  }

  const confirmAction = confirming ? STATUS_ACTIONS[confirming] : null

  return (
    <div className="space-y-4">
      {confirming && confirmAction ? (
        <div
          role="group"
          aria-label={`Confirm: ${confirmAction.label}`}
          className="space-y-3 rounded-2xl border-2 border-cherry-deep bg-cherry/5 p-4"
        >
          <p className="font-semibold">{confirmAction.confirm}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => apply(confirming)}
              disabled={changeStatus.isPending}
              className={CONFIRM_DANGER_BUTTON}
            >
              {changeStatus.isPending ? 'Saving…' : `Yes, ${confirmAction.label.toLowerCase()}`}
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={NEUTRAL_BUTTON}>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {booking.allowed_next_statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => choose(status)}
              disabled={changeStatus.isPending}
              className={actionClasses(STATUS_ACTIONS[status].tone)}
            >
              {STATUS_ACTIONS[status].label}
            </button>
          ))}
        </div>
      )}
      {changeStatus.isError && <FormMessage tone="error">{saveErrorMessage(changeStatus.error)}</FormMessage>}
      {changedTo && !changeStatus.isPending && !changeStatus.isError && (
        <FormMessage tone="success">Booking marked {BOOKING_STATUS_LABELS[changedTo].toLowerCase()}.</FormMessage>
      )}
    </div>
  )
}
