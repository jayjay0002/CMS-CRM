import { type ReactNode, useEffect, useId, useRef } from 'react'

import { buttonClasses } from './buttonStyles'

const CANCEL_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold hover:bg-butter-soft'
const DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-cherry px-4 py-2 font-semibold text-kernel hover:bg-cherry-deep disabled:opacity-50'

type Props = {
  isOpen: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  // Shown on the confirm button while the action runs.
  busyLabel: string
  isBusy?: boolean
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onClose: () => void
}

// A modal confirm step. The native <dialog> traps focus, closes on Esc and returns focus afterwards.
export function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel,
  busyLabel,
  isBusy = false,
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onClose,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-3xl border-4 border-ink bg-kernel p-0 text-ink shadow-sign-lg backdrop:bg-ink/50"
    >
      <div className="space-y-4 p-6">
        <h2 id={titleId} className="font-display text-2xl">
          {title}
        </h2>
        <div className="space-y-3">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={isBusy} className={CANCEL_BUTTON}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={tone === 'danger' ? DANGER_BUTTON : buttonClasses('primary', 'px-5 py-2')}
          >
            {isBusy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
