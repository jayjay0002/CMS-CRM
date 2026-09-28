import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type ReactNode, useState } from 'react'

// A small movement before a pointer drag starts, so clicks on the handle aren't drags.
const DRAG_ACTIVATION_PX = 4

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    'To reorder, press Space or Enter to pick up the item, use the up and down arrow keys to move it, then press Space or Enter again to drop it. Press Escape to cancel.',
}

type Props = {
  itemKeys: readonly string[]
  onMove: (from: number, to: number) => void
  // Name of the item at an index, e.g. "Highlight 2".
  itemLabel: (index: number) => string
  // The item's card content; `handle` is the ⠿ drag handle to place in it.
  renderItem: (index: number, handle: ReactNode) => ReactNode
}

// A list whose items can be dragged into a new order by the ⠿ handle (mouse, touch or keyboard).
export function SortableItems({ itemKeys, onMove, itemLabel, renderItem }: Props) {
  const [activeKey, setActiveKey] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const indexOf = (key: UniqueIdentifier) => itemKeys.indexOf(String(key))
  const labelOf = (key: UniqueIdentifier) => itemLabel(indexOf(key))
  const positionText = (key: UniqueIdentifier) => `position ${indexOf(key) + 1} of ${itemKeys.length}`

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${labelOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${labelOf(active.id)} is now at ${positionText(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${labelOf(active.id)} at ${positionText(over.id)}.` : `Dropped ${labelOf(active.id)}.`,
    onDragCancel: ({ active }) => `Cancelled. ${labelOf(active.id)} stays where it was.`,
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveKey(null)
    if (!over) return
    const from = indexOf(active.id)
    const to = indexOf(over.id)
    if (from !== to && from !== -1 && to !== -1) onMove(from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveKey(active.id)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveKey(null)}
      accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
    >
      <SortableContext items={[...itemKeys]} strategy={verticalListSortingStrategy}>
        <ol className="space-y-3">
          {itemKeys.map((key, index) => (
            <SortableItem key={key} itemKey={key} label={itemLabel(index)}>
              {(handle) => renderItem(index, handle)}
            </SortableItem>
          ))}
        </ol>
      </SortableContext>
      <DragOverlay>
        {activeKey !== null && (
          <div className="flex w-max items-center gap-2 rounded-2xl border-2 border-ink bg-butter-soft px-4 py-2 font-semibold shadow-sign">
            <span aria-hidden="true">⠿</span>
            {labelOf(activeKey)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

type ItemProps = {
  itemKey: string
  label: string
  children: (handle: ReactNode) => ReactNode
}

function SortableItem({ itemKey, label, children }: ItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: itemKey,
  })

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${label}`}
      className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-lg text-ink/55 hover:bg-butter-soft hover:text-ink active:cursor-grabbing"
    >
      <span aria-hidden="true">⠿</span>
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      // Position comes from the drag in progress, so it can't be a static class.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`rounded-2xl border-2 border-ink/20 bg-white p-4 ${isDragging ? 'relative outline-2 outline-offset-2 outline-cherry outline-dashed [&>*]:opacity-30' : ''}`}
    >
      {children(handle)}
    </li>
  )
}
