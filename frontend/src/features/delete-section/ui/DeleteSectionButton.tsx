import { useEffect, useRef, useState } from 'react'

import { type AdminSection, sectionTitle } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'

import { useDeleteSection } from '../model/useDeleteSection'

const SMALL_BUTTON = 'rounded-full border-2 px-3 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  section: AdminSection
  onDeleted?: () => void
}

// Delete with a second, explicit step, since it can't be undone.
export function DeleteSectionButton({ section, onDeleted }: Props) {
  const remove = useDeleteSection()
  const [isConfirming, setIsConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const title = sectionTitle(section)

  useEffect(() => {
    if (isConfirming) cancelRef.current?.focus()
  }, [isConfirming])

  if (!section.isRemovable) return null

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className={`${SMALL_BUTTON} border-cherry text-cherry-deep hover:bg-cherry/10`}
      >
        Delete<span className="sr-only"> {title}</span>
      </button>
    )
  }

  return (
    <div role="alertdialog" aria-label={`Delete ${title}?`} className="w-full rounded-xl border-2 border-cherry bg-cherry/10 p-3">
      <p className="text-sm font-bold text-cherry-deep">Delete “{title}”? This can’t be undone.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => remove.mutate(section.id, { onSuccess: onDeleted })}
          className={`${SMALL_BUTTON} border-cherry-deep bg-cherry text-kernel hover:bg-cherry-deep`}
        >
          {remove.isPending ? 'Deleting…' : 'Yes, delete it'}
        </button>
        <button
          ref={cancelRef}
          type="button"
          onClick={() => setIsConfirming(false)}
          className={`${SMALL_BUTTON} border-ink hover:bg-butter`}
        >
          Keep it
        </button>
      </div>
      {remove.isError && (
        <p role="alert" className="mt-2 text-xs font-semibold text-cherry-deep">
          {saveErrorMessage(remove.error)}
        </p>
      )}
    </div>
  )
}
