import { type AdminSection, SECTION_META, type SectionType } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'

import { useReorderSections } from '../model/useReorderSections'

const DIRECTIONS = {
  up: -1,
  down: 1,
} as const

type Direction = keyof typeof DIRECTIONS

function moved(types: readonly SectionType[], index: number, direction: Direction): SectionType[] {
  const target = index + DIRECTIONS[direction]
  const order = [...types]
  const [item] = order.splice(index, 1)
  if (item) order.splice(target, 0, item)
  return order
}

const BUTTON_CLASSES =
  'grid size-7 place-items-center rounded-full border-2 border-ink text-sm font-bold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/30 disabled:hover:bg-transparent'

type Props = {
  // Every section, in display order.
  sections: readonly AdminSection[]
  index: number
}

export function MoveSectionButtons({ sections, index }: Props) {
  const reorder = useReorderSections()

  const section = sections[index]
  if (!section) return null
  const label = SECTION_META[section.type].label
  const types = sections.map((item) => item.type)
  const isFirst = index === 0
  const isLast = index === sections.length - 1

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => reorder.mutate(moved(types, index, 'up'))}
          disabled={isFirst || reorder.isPending}
          aria-label={`Move ${label} up`}
          className={BUTTON_CLASSES}
        >
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          onClick={() => reorder.mutate(moved(types, index, 'down'))}
          disabled={isLast || reorder.isPending}
          aria-label={`Move ${label} down`}
          className={BUTTON_CLASSES}
        >
          <span aria-hidden="true">↓</span>
        </button>
      </div>
      {reorder.isError && (
        <p role="alert" className="text-xs font-semibold text-cherry-deep">
          {saveErrorMessage(reorder.error)}
        </p>
      )}
    </div>
  )
}
