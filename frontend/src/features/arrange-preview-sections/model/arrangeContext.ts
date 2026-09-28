import { createContext, useContext } from 'react'

import type { DropTarget } from '../lib/dropTarget'

export type ArrangeState = {
  // Ids of the sections on the page, top to bottom.
  ids: readonly number[]
  draggingId: number | null
  // Where the dragged section would land; null while not dragging or over its own spot.
  dropTarget: DropTarget | null
  move: (sectionId: number, target: DropTarget) => void
}

export const ArrangeContext = createContext<ArrangeState | null>(null)

export function useArrange(): ArrangeState {
  const state = useContext(ArrangeContext)
  if (!state) throw new Error('useArrange must be used inside <SectionArranger>')
  return state
}
