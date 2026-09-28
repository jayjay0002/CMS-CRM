import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

import { type SiteSection, sectionTitle } from '@/entities/site'

import { ARRANGE_SECTION_ATTRIBUTE } from '../config/constants'
import { moveDownTarget, moveUpTarget } from '../lib/dropTarget'
import { useArrange } from '../model/arrangeContext'

const TOOL_BUTTON =
  'grid size-8 place-items-center rounded-lg hover:bg-butter focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-35 disabled:hover:bg-transparent'

function DropLine({ position }: { position: 'top' | 'bottom' }) {
  const edge = position === 'top' ? '-top-1' : '-bottom-1'
  // Dark line with a light ring, so it shows on every section colour.
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-30 h-2 rounded-full bg-ink ring-2 ring-kernel ${edge}`}
    >
      <span className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-2 border-kernel bg-cherry px-3 py-0.5 text-xs font-bold text-kernel">
        Drop here
      </span>
    </div>
  )
}

type Props = {
  section: SiteSection
  children: ReactNode
}

// One section of the preview with its move toolbar, shown on hover or keyboard focus.
export function ArrangeableSection({ section, children }: Props) {
  const { ids, draggingId, dropTarget, move } = useArrange()
  const { attributes, listeners, setNodeRef: setDragNodeRef } = useDraggable({ id: section.id })
  const { setNodeRef: setDropNodeRef } = useDroppable({ id: section.id })
  const title = sectionTitle(section)
  const up = moveUpTarget(ids, section.id)
  const down = moveDownTarget(ids, section.id)
  const isLast = ids[ids.length - 1] === section.id
  const isDragging = draggingId === section.id

  return (
    <div
      ref={setDropNodeRef}
      {...{ [ARRANGE_SECTION_ATTRIBUTE]: section.id }}
      className={`group/arrange relative hover:outline-2 hover:outline-offset-[-2px] hover:outline-cherry/60 hover:outline-dashed ${isDragging ? 'opacity-40' : ''}`}
    >
      {/* Sticks below the site header while the section is in view. */}
      <div className="pointer-events-none sticky top-20 z-30 h-0">
        <div
          role="toolbar"
          aria-label={`Move ${title}`}
          className={`pointer-events-auto absolute top-3 left-3 flex items-center gap-0.5 rounded-xl border-2 border-ink bg-kernel p-1 text-ink shadow-sign transition-opacity group-focus-within/arrange:opacity-100 group-hover/arrange:opacity-100 ${draggingId === null ? 'opacity-0' : 'invisible'}`}
        >
          <button
            // The handle is the drag node too, so the floating card starts where it was grabbed.
            ref={setDragNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag to move ${title}`}
            className={`${TOOL_BUTTON} cursor-grab touch-none active:cursor-grabbing`}
          >
            <span aria-hidden="true">⠿</span>
          </button>
          <span className="px-1.5 text-sm font-bold whitespace-nowrap">{title}</span>
          <button
            type="button"
            disabled={!up}
            onClick={() => up && move(section.id, up)}
            aria-label={`Move ${title} up`}
            className={TOOL_BUTTON}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            type="button"
            disabled={!down}
            onClick={() => down && move(section.id, down)}
            aria-label={`Move ${title} down`}
            className={TOOL_BUTTON}
          >
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
      {children}
      {dropTarget?.beforeId === section.id && <DropLine position="top" />}
      {isLast && dropTarget !== null && dropTarget.beforeId === null && <DropLine position="bottom" />}
    </div>
  )
}
