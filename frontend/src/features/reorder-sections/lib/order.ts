// The ids with the item at `from` moved to `to`.
export function movedIds(ids: readonly number[], from: number, to: number): number[] {
  const order = [...ids]
  const [item] = order.splice(from, 1)
  if (item !== undefined) order.splice(to, 0, item)
  return order
}

// The ids with `id` moved to sit right before `beforeId`, or to the end when `beforeId` is null.
// Unknown ids (e.g. a section deleted meanwhile) leave the order unchanged.
export function idsWithMovedBefore(ids: readonly number[], id: number, beforeId: number | null): number[] {
  if (!ids.includes(id)) return [...ids]
  const order = ids.filter((each) => each !== id)
  if (beforeId === null) return [...order, id]
  const target = order.indexOf(beforeId)
  if (target === -1) return [...ids]
  order.splice(target, 0, id)
  return order
}
