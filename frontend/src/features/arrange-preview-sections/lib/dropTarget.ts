// Where a moved section lands: right before `beforeId`, or at the end of the page when null.
export type DropTarget = { beforeId: number | null }

function idAfter(ids: readonly number[], id: number): number | null {
  const index = ids.indexOf(id)
  return index === -1 ? null : (ids[index + 1] ?? null)
}

// Dropping on the upper half of a section puts the moved one above it, the lower half below it.
export function dropTargetFor(ids: readonly number[], overId: number, isUpperHalf: boolean): DropTarget {
  return { beforeId: isUpperHalf ? overId : idAfter(ids, overId) }
}

// Dropping a section right where it already is changes nothing.
export function isSamePlace(ids: readonly number[], movedId: number, target: DropTarget): boolean {
  return target.beforeId === movedId || target.beforeId === idAfter(ids, movedId)
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
