import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

export type MenuItem = {
  label: string
  onSelect: () => void
  tone?: 'danger'
  // Opens a page in a new tab instead of running an action.
  href?: string
}

type Props = {
  // Accessible name of the trigger, e.g. "More actions".
  label: string
  items: readonly MenuItem[]
}

const TRIGGER =
  'grid size-10 place-items-center rounded-full border-2 border-ink bg-white text-lg font-bold hover:bg-butter-soft'
const ITEM = 'block w-full px-4 py-2.5 text-left font-semibold hover:bg-butter-soft focus:bg-butter-soft focus:outline-none'

// A "⋯" menu: arrow keys move between items, Esc closes and returns focus to the trigger.
export function MenuButton({ label, items }: Props) {
  const menuId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined
    itemRefs.current[0]?.focus()
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [isOpen])

  function close() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = itemRefs.current.findIndex((item) => item === document.activeElement)
    const last = items.length - 1
    const moves: Record<string, number> = {
      ArrowDown: current >= last ? 0 : current + 1,
      ArrowUp: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      itemRefs.current[moves[event.key] ?? 0]?.focus()
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      close()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className={TRIGGER}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-30 mt-2 min-w-56 overflow-hidden rounded-2xl border-2 border-ink bg-white py-1 shadow-sign"
        >
          {items.map((item, index) => {
            const className = `${ITEM} ${item.tone === 'danger' ? 'text-cherry-deep' : ''}`
            const select = () => {
              setIsOpen(false)
              item.onSelect()
            }
            return item.href ? (
              <a
                key={item.label}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                role="menuitem"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={select}
                className={className}
              >
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <button
                key={item.label}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                type="button"
                role="menuitem"
                onClick={select}
                className={className}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
