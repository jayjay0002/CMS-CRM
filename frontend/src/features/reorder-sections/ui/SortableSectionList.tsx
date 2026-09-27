import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type ReactNode, useState } from 'react'

import { type AdminSection, sectionTitle } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'

import { movedIds } from '../lib/order'
import { useReorderSections } from '../model/useReorderSections'
import { MoveSectionButtons } from './MoveSectionButtons'

// A small movement before a pointer drag starts, so clicks on the handle aren't drags.
const DRAG_ACTIVATION_PX = 4

export type SectionRowControls = {
  // The ⠿ handle: drag with a pointer, or focus it and use Space + arrow keys.
  dragHandle: ReactNode
  moveButtons: ReactNode
}

type Props = {
  // Every section, in display order.
  sections: readonly AdminSection[]
  renderRow: (section: AdminSection, controls: SectionRowControls) => ReactNode
  // Renders the floating card while dragging.
  renderDragPreview: (section: AdminSection) => ReactNode
}

function positionText(index: number, total: number): string {
  return `position ${index + 1} of ${total}`
}

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    'To reorder, press Space or Enter to pick up the section, use the up and down arrow keys to move it, then press Space or Enter again to drop it. Press Escape to cancel.',
}

// A list you can reorder by dragging (mouse, touch or keyboard) or with up/down buttons.
// Saves the new order right away; the list updates first and rolls back if saving fails.
export function SortableSectionList({ sections, renderRow, renderDragPreview }: Props) {
  const reorder = useReorderSections()
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = sections.map((section) => section.id)
  const total = sections.length
  const indexOf = (id: UniqueIdentifier) => ids.indexOf(Number(id))
  const titleOf = (id: UniqueIdentifier) => {
    const section = sections[indexOf(id)]
    return section ? sectionTitle(section) : 'Section'
  }
  const active = activeId === null ? undefined : sections[indexOf(activeId)]

  const announcements: Announcements = {
    onDragStart: ({ active: item }) => `Picked up ${titleOf(item.id)}, ${positionText(indexOf(item.id), total)}.`,
    onDragOver: ({ active: item, over }) =>
      over ? `${titleOf(item.id)} is now at ${positionText(indexOf(over.id), total)}.` : undefined,
    onDragEnd: ({ active: item, over }) =>
      over ? `Dropped ${titleOf(item.id)} at ${positionText(indexOf(over.id), total)}.` : `Dropped ${titleOf(item.id)}.`,
    onDragCancel: ({ active: item }) => `Cancelled. ${titleOf(item.id)} stays where it was.`,
  }

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= total) return
    reorder.mutate(movedIds(ids, from, to))
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function onDragEnd({ active: item, over }: DragEndEvent) {
    setActiveId(null)
    if (over) move(indexOf(item.id), indexOf(over.id))
  }

  return (
    <div>
      {reorder.isError && (
        <p role="alert" className="mb-2 rounded-xl border-2 border-cherry bg-cherry/10 px-3 py-2 text-sm font-semibold text-cherry-deep">
          The new order wasn't saved: {saveErrorMessage(reorder.error)}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {sections.map((section, index) => (
              <SortableRow
                key={section.id}
                section={section}
                controls={(handle) => ({
                  dragHandle: handle,
                  moveButtons: (
                    <MoveSectionButtons
                      label={sectionTitle(section)}
                      canMoveUp={index > 0}
                      canMoveDown={index < total - 1}
                      onMoveUp={() => move(index, index - 1)}
                      onMoveDown={() => move(index, index + 1)}
                    />
                  ),
                })}
                renderRow={renderRow}
              />
            ))}
          </ol>
        </SortableContext>
        <DragOverlay>{active ? renderDragPreview(active) : null}</DragOverlay>
      </DndContext>
    </div>
  )
}

type RowProps = {
  section: AdminSection
  controls: (handle: ReactNode) => SectionRowControls
  renderRow: Props['renderRow']
}

function SortableRow({ section, controls, renderRow }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${sectionTitle(section)}`}
      className="grid h-10 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-lg text-ink/55 hover:bg-butter-soft hover:text-ink active:cursor-grabbing"
    >
      <span aria-hidden="true">⠿</span>
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      // Position comes from the drag in progress, so it can't be a static class.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'relative rounded-2xl outline-2 outline-offset-2 outline-cherry outline-dashed [&>*]:opacity-30' : 'relative'}
    >
      {renderRow(section, controls(handle))}
    </li>
  )
}
