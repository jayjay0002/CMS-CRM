import { useEffect } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

type Options<Values extends FieldValues, Draft> = {
  form: UseFormReturn<Values>
  // Turns the raw form values into what the caller wants to see (e.g. section content).
  toDraft: (values: Values) => Draft
  // Called on every edit with the current, unsaved values.
  onDraftChange?: (draft: Draft) => void
  onDirtyChange?: (isDirty: boolean) => void
}

// Lets a form report its unsaved state upward (live previews, "leave without saving?" prompts).
export function useDraftReporting<Values extends FieldValues, Draft>({
  form,
  toDraft,
  onDraftChange,
  onDirtyChange,
}: Options<Values, Draft>): void {
  const { watch, getValues } = form
  const { isDirty } = form.formState

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (!onDraftChange) return undefined
    const subscription = watch(() => onDraftChange(toDraft(getValues())))
    return () => subscription.unsubscribe()
  }, [watch, getValues, toDraft, onDraftChange])
}
