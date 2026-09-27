import type { FormEventHandler, ReactNode } from 'react'

import { saveErrorMessage } from '../api'

import { buttonClasses } from './buttonStyles'
import { FormMessage } from './FormMessage'

export type SaveStatus = {
  isPending: boolean
  isSuccess: boolean
  error: Error | null
}

type Props = {
  onSubmit: FormEventHandler<HTMLFormElement>
  // Puts the fields back to the last saved values.
  onDiscard: () => void
  status: SaveStatus
  isDirty: boolean
  submitLabel?: string
  children: ReactNode
}

// A form that fills its container: the fields scroll, the save bar stays pinned at the bottom.
export function EditorShell({ onSubmit, onDiscard, status, isDirty, submitLabel = 'Save changes', children }: Props) {
  const isSaved = status.isSuccess && !isDirty

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="@container relative min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
      <div className="shrink-0 space-y-3 border-t-2 border-ink/15 bg-kernel px-5 py-4">
        {status.error && <FormMessage tone="error">{saveErrorMessage(status.error)}</FormMessage>}
        {isSaved && <FormMessage tone="success">Saved. The website is updated.</FormMessage>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={status.isPending || !isDirty} className={buttonClasses('primary', 'px-5 py-2.5')}>
            {status.isPending ? 'Saving…' : submitLabel}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={!isDirty || status.isPending}
            className="rounded-full px-3 py-2 text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-cherry-deep disabled:cursor-not-allowed disabled:text-ink/35 disabled:no-underline"
          >
            Discard
          </button>
          {isDirty && (
            <span role="status" className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-cherry-deep">
              <span aria-hidden="true" className="size-2 rounded-full bg-cherry" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>
    </form>
  )
}
