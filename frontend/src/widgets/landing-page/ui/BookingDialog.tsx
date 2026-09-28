import { type MouseEvent, useEffect, useId, useRef } from 'react'

import { BookingForm } from '@/features/book-cart'
import { buttonClasses } from '@/shared/ui'

type Props = {
  isOpen: boolean
  heading: string
  contactPhone: string
  selectedPackageSlug: string | null
  isPreview: boolean
  onClose: () => void
}

// The booking form as a modal: full screen on phones, a centered card from `sm` up.
// It stays mounted while closed so a half-filled form survives closing and reopening.
export function BookingDialog({ isOpen, heading, contactPhone, selectedPackageSlug, isPreview, onClose }: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // showModal() traps focus, closes on Esc and returns focus to the button afterwards.
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  // A click whose target is the dialog itself landed on the backdrop, outside the content.
  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={closeOnBackdropClick}
      className="m-0 h-dvh max-h-none w-full max-w-none overscroll-contain bg-kernel p-0 text-ink backdrop:bg-ink/60 sm:m-auto sm:h-fit sm:max-h-[calc(100dvh-3rem)] sm:w-[min(46rem,calc(100vw-3rem))] sm:rounded-3xl sm:border-4 sm:border-ink sm:shadow-sign-lg"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-ink bg-butter px-5 py-4 md:px-8">
        <h2 id={titleId} className="min-w-0 font-display text-2xl text-balance md:text-3xl">
          {heading}
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className={buttonClasses('secondary', 'shrink-0 px-4 py-2 text-sm')}
        >
          Close
        </button>
      </div>
      <div className="relative p-5 md:p-8">
        <BookingForm selectedPackageSlug={selectedPackageSlug} contactPhone={contactPhone} isPreview={isPreview} />
      </div>
    </dialog>
  )
}
