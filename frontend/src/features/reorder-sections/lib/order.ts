// The ids with the item at `from` moved to `to`.
export function movedIds(ids: readonly number[], from: number, to: number): number[] {
  const order = [...ids]
  const [item] = order.splice(from, 1)
  if (item !== undefined) order.splice(to, 0, item)
  return order
}
