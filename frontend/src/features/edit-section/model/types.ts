export type SaveStatus = {
  isPending: boolean
  isSuccess: boolean
  error: Error | null
}

// Every section form gets its current content and reports edits back through onSave.
export type SectionFormProps<Content> = {
  content: Content
  onSave: (content: Content, onSaved: () => void) => void
  status: SaveStatus
  onClose: () => void
}
