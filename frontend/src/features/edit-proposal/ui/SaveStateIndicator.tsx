import { SAVE_STATES, type SaveState } from '../config/editor'

const LABELS: Record<SaveState, string> = {
  [SAVE_STATES.saved]: 'All changes saved',
  [SAVE_STATES.pending]: 'Unsaved changes…',
  [SAVE_STATES.saving]: 'Saving…',
  [SAVE_STATES.error]: 'Couldn’t save',
  [SAVE_STATES.invalid]: 'Fix the highlighted fields',
}

const DOT_CLASSES: Record<SaveState, string> = {
  [SAVE_STATES.saved]: 'bg-ink/30',
  [SAVE_STATES.pending]: 'bg-butter ring-2 ring-ink/40',
  [SAVE_STATES.saving]: 'animate-pulse bg-butter ring-2 ring-ink/40',
  [SAVE_STATES.error]: 'bg-cherry',
  [SAVE_STATES.invalid]: 'bg-cherry',
}

type Props = {
  state: SaveState
  onRetry: () => void
}

// Autosave status, announced to screen readers as it changes.
export function SaveStateIndicator({ state, onRetry }: Props) {
  const isProblem = state === SAVE_STATES.error || state === SAVE_STATES.invalid
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span aria-hidden="true" className={`size-2.5 rounded-full ${DOT_CLASSES[state]}`} />
      <span role="status" className={isProblem ? 'font-semibold text-cherry-deep' : 'text-ink/70'}>
        {LABELS[state]}
      </span>
      {state === SAVE_STATES.error && (
        <button type="button" onClick={onRetry} className="font-semibold underline decoration-2 underline-offset-2">
          Retry
        </button>
      )}
    </span>
  )
}
