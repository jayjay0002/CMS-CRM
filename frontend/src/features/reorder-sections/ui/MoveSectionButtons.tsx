const BUTTON_CLASSES =
  'grid size-7 place-items-center rounded-full border-2 border-ink text-sm font-bold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/30 disabled:hover:bg-transparent'

type Props = {
  // Names the section for screen readers.
  label: string
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

// Up/down buttons: the fallback for people who don't drag.
export function MoveSectionButtons({ label, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: Props) {
  return (
    <div className="flex gap-1">
      <button type="button" onClick={onMoveUp} disabled={!canMoveUp} aria-label={`Move ${label} up`} className={BUTTON_CLASSES}>
        <span aria-hidden="true">↑</span>
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label={`Move ${label} down`}
        className={BUTTON_CLASSES}
      >
        <span aria-hidden="true">↓</span>
      </button>
    </div>
  )
}
