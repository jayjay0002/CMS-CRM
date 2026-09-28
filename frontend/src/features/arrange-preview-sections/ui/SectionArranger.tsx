import {
  DndContext,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { type ReactNode, useState } from 'react'

import { type SiteSection, sectionTitle } from '@/entities/site'

import { DRAG_ACTIVATION_PX } from '../config/constants'
import { type DropTarget, dropTargetFor, isSamePlace } from '../lib/dropTarget'
import { ArrangeContext, type ArrangeState } from '../model/arrangeContext'

// Where the drop would put the section, e.g. "below Hero". The line can be off-screen when a
// section is tall, so the floating card says it too.
function destinationText(sections: readonly SiteSection[], { beforeId }: DropTarget): string {
  const beforeIndex = beforeId === null ? sections.length : sections.findIndex((section) => section.id === beforeId)
  const previous = sections[beforeIndex - 1]
  if (previous) return `below ${sectionTitle(previous)}`
  const first = sections[0]
  return first ? `above ${sectionTitle(first)}` : ''
}

type Props = {
  // The sections on the page, top to bottom.
  sections: readonly SiteSection[]
  onMove: (sectionId: number, target: DropTarget) => void
  children: ReactNode
}

// Lets the admin drag sections of the preview into a new order (see ArrangeableSection).
export function SectionArranger({ sections, onMove, children }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_PX } }))
  const ids = sections.map((section) => section.id)
  const dragging = sections.find((section) => section.id === draggingId)

  function move(sectionId: number, target: DropTarget) {
    if (!isSamePlace(ids, sectionId, target)) onMove(sectionId, target)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    // Over the site header or footer: keep showing the last spot.
    if (!over) return
    setDropTarget(dropTargetFor(ids, Number(active.id), Number(over.id)))
  }

  function endDrag() {
    setDraggingId(null)
    setDropTarget(null)
  }

  function onDragEnd() {
    if (draggingId !== null && dropTarget) onMove(draggingId, dropTarget)
    endDrag()
  }

  const state: ArrangeState = { ids, draggingId, dropTarget, move }

  return (
    <ArrangeContext value={state}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={(event: DragStartEvent) => setDraggingId(Number(event.active.id))}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={endDrag}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {dragging && (
            <div className="flex w-max items-center gap-2 rounded-2xl border-2 border-ink bg-butter px-4 py-2 font-bold text-ink shadow-sign">
              <span aria-hidden="true">⠿</span>
              {sectionTitle(dragging)}
              {dropTarget && (
                <span className="font-semibold text-ink/75">→ {destinationText(sections, dropTarget)}</span>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </ArrangeContext>
  )
}
