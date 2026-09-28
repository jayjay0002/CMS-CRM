// Where a moved section lands: right before `beforeId`, or at the end of the page when null.
export type DropTarget = { beforeId: number | null }

function idAfter(ids: readonly number[], id: number): number | null {
  const index = ids.indexOf(id)
  return index === -1 ? null : (ids[index + 1] ?? null)
}

// Like a sortable list: over a section below, the moved one goes after it; above, before it.
// Reaching any part of a neighbour is enough, however tall it is.
export function dropTargetFor(ids: readonly number[], movedId: number, overId: number): DropTarget | null {
  const movedIndex = ids.indexOf(movedId)
  const overIndex = ids.indexOf(overId)
  if (movedIndex === -1 || overIndex === -1 || movedIndex === overIndex) return null
  return { beforeId: overIndex > movedIndex ? idAfter(ids, overId) : overId }
}

// Dropping a section right where it already is changes nothing.
export function isSamePlace(ids: readonly number[], movedId: number, target: DropTarget): boolean {
  return target.beforeId === movedId || target.beforeId === idAfter(ids, movedId)
}

// The line marking a drop goes on the boundary above `beforeId`: under the section before it,
// or above the first section.
export function dropLineEdge(ids: readonly number[], sectionId: number, target: DropTarget): 'top' | 'bottom' | null {
  if (idAfter(ids, sectionId) === target.beforeId && ids.includes(sectionId)) return 'bottom'
  if (ids[0] === sectionId && target.beforeId === sectionId) return 'top'
  return null
}

export function moveUpTarget(ids: readonly number[], id: number): DropTarget | null {
  const index = ids.indexOf(id)
  const previous = ids[index - 1]
  return index > 0 && previous !== undefined ? { beforeId: previous } : null
}

export function moveDownTarget(ids: readonly number[], id: number): DropTarget | null {
  const index = ids.indexOf(id)
  if (index === -1 || index === ids.length - 1) return null
  return { beforeId: ids[index + 2] ?? null }
}
