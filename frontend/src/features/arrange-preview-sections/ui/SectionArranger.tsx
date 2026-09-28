import {
  DndContext,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { type ReactNode, useState } from 'react'

import { type SiteSection, sectionTitle } from '@/entities/site'

import { ARRANGE_SECTION_ATTRIBUTE, DRAG_ACTIVATION_PX } from '../config/constants'
import { type DropTarget, dropTargetFor, isSamePlace } from '../lib/dropTarget'
import { ArrangeContext, type ArrangeState } from '../model/arrangeContext'

// Where the pointer is now: where the drag started plus how far it has moved.
function pointerY({ activatorEvent, delta }: DragMoveEvent): number | null {
  return activatorEvent instanceof PointerEvent ? activatorEvent.clientY + delta.y : null
}

function isInUpperHalf(sectionId: number, clientY: number): boolean {
  const frame = document.querySelector(`[${ARRANGE_SECTION_ATTRIBUTE}="${sectionId}"]`)
  if (!frame) return true
  const { top, height } = frame.getBoundingClientRect()
  return clientY < top + height / 2
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

  function onDragMove(event: DragMoveEvent) {
    const clientY = pointerY(event)
    // Over the header or between frames: keep showing the last spot.
    if (!event.over || clientY === null) return
    const overId = Number(event.over.id)
    const target = dropTargetFor(ids, overId, isInUpperHalf(overId, clientY))
    setDropTarget(isSamePlace(ids, Number(event.active.id), target) ? null : target)
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
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={endDrag}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {dragging && (
            <div className="flex w-max items-center gap-2 rounded-2xl border-2 border-ink bg-butter px-4 py-2 font-bold text-ink shadow-sign">
              <span aria-hidden="true">⠿</span>
              {sectionTitle(dragging)}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </ArrangeContext>
  )
}
