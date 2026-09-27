import { useId, useState } from 'react'

import {
  BOOKING_STATUS_LABELS,
  type BookingDetail,
  type BookingStatus,
  type BookingStatusChange,
  STATUS_MESSAGE_MAX_LENGTH,
} from '@/entities/booking'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { STATUS_ACTIONS } from '../config/actions'
import { useChangeBookingStatus } from '../model/useChangeBookingStatus'

const NEUTRAL_BUTTON =
  'rounded-full border-2 border-ink bg-white px-5 py-2.5 font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-50'
const DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-white px-5 py-2.5 font-semibold text-cherry-deep hover:bg-cherry/10 disabled:cursor-not-allowed disabled:opacity-50'
const CONFIRM_DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-cherry px-5 py-2.5 font-semibold text-kernel hover:bg-cherry-deep disabled:opacity-50'
const MESSAGE_ROWS = 3

function actionClasses(tone: (typeof STATUS_ACTIONS)[BookingStatus]['tone']): string {
  if (tone === 'primary') return buttonClasses('primary', 'px-5 py-2.5')
  return tone === 'danger' ? DANGER_BUTTON : NEUTRAL_BUTTON
}

type Props = {
  booking: BookingDetail
}

export function BookingStatusActions({ booking }: Props) {
  const changeStatus = useChangeBookingStatus(booking.id)
  const notifyId = useId()
  const messageId = useId()
  const [confirming, setConfirming] = useState<BookingStatus | null>(null)
  const [changedTo, setChangedTo] = useState<BookingStatus | null>(null)
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [message, setMessage] = useState('')

  function apply(status: BookingStatus) {
    setChangedTo(null)
    const change: BookingStatusChange = { status, notify_customer: notifyCustomer }
    const trimmed = message.trim()
    if (STATUS_ACTIONS[status].offersMessage && notifyCustomer && trimmed) change.message = trimmed
    changeStatus.mutate(change, {
      onSuccess: () => {
        setChangedTo(status)
        setMessage('')
      },
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

  const successMessage = changedTo && !changeStatus.isPending && !changeStatus.isError && (
    <FormMessage tone="success">Booking marked {BOOKING_STATUS_LABELS[changedTo].toLowerCase()}.</FormMessage>
  )

  if (booking.allowed_next_statuses.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage}
        <p className="text-ink/75">
          This booking is {BOOKING_STATUS_LABELS[booking.status].toLowerCase()}. Its status can’t change
          anymore.
        </p>
      </div>
    )
  }

  const confirmAction = confirming ? STATUS_ACTIONS[confirming] : null
  const canEmail = booking.allowed_next_statuses.some((status) => STATUS_ACTIONS[status].emailsCustomer)

  return (
    <div className="space-y-4">
      {canEmail && (
        <div>
          <label htmlFor={notifyId} className="inline-flex cursor-pointer items-center gap-2 font-semibold">
            <input
              id={notifyId}
              type="checkbox"
              checked={notifyCustomer}
              onChange={(event) => setNotifyCustomer(event.target.checked)}
              className="size-5 accent-cherry"
            />
            Email the customer
          </label>
          <p className="mt-0.5 text-sm text-ink/65">
            Sends {booking.customer_email} a short email when you approve or decline.
          </p>
        </div>
      )}

      {confirming && confirmAction ? (
        <div
          role="group"
          aria-label={`Confirm: ${confirmAction.label}`}
          className="space-y-3 rounded-2xl border-2 border-cherry-deep bg-cherry/5 p-4"
        >
          <p className="font-semibold">{confirmAction.confirm}</p>
          {confirmAction.offersMessage && notifyCustomer && (
            <div>
              <label htmlFor={messageId} className="mb-1.5 block font-semibold">
                Message to the customer <span className="font-normal text-ink/70">(optional)</span>
              </label>
              <textarea
                id={messageId}
                rows={MESSAGE_ROWS}
                maxLength={STATUS_MESSAGE_MAX_LENGTH}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Sorry, we’re already booked that day. We’d love to pop for you another time!"
                className={INPUT_CLASSES}
              />
            </div>
          )}
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
      {successMessage}
    </div>
  )
}
