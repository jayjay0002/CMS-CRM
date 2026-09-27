import type { SaveStatus } from '@/shared/ui'

// Every section form gets its current content and reports edits back.
export type SectionFormProps<Content> = {
  content: Content
  onSave: (content: Content, onSaved: () => void) => void
  status: SaveStatus
  // Called on every edit with the unsaved content (drives the live preview).
  onDraftChange?: (content: Content) => void
  onDirtyChange?: (isDirty: boolean) => void
}
