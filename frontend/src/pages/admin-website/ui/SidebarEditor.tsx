import { useEffect, useRef } from 'react'

import { type AdminSection, SECTION_META, type SiteSettings } from '@/entities/site'
import { SectionEditor } from '@/features/edit-section'
import { SiteSettingsForm } from '@/features/edit-site-settings'

import type { BuilderSelection } from '../model/selection'

type LeavePromptProps = {
  onDiscard: () => void
  onKeepEditing: () => void
}

// Asked before leaving a form with unsaved changes.
function LeavePrompt({ onDiscard, onKeepEditing }: LeavePromptProps) {
  const keepEditingRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    keepEditingRef.current?.focus()
  }, [])

  return (
    <div role="alertdialog" aria-labelledby="leave-prompt-title" className="mt-3 rounded-2xl border-2 border-cherry bg-cherry/10 p-4">
      <p id="leave-prompt-title" className="font-bold text-cherry-deep">
        You have unsaved changes.
      </p>
      <p className="mt-1 text-sm text-ink/80">Leave anyway? Your edits will be lost.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-full border-2 border-cherry-deep bg-cherry px-4 py-1.5 text-sm font-bold text-kernel hover:bg-cherry-deep"
        >
          Discard changes
        </button>
        <button
          ref={keepEditingRef}
          type="button"
          onClick={onKeepEditing}
          className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold hover:bg-butter"
        >
          Keep editing
        </button>
      </div>
    </div>
  )
}

type Props = {
  selection: BuilderSelection
  settings: SiteSettings
  sections: readonly AdminSection[]
  isConfirmingLeave: boolean
  onBack: () => void
  onConfirmLeave: () => void
  onCancelLeave: () => void
  onSettingsDraft: (settings: SiteSettings) => void
  onSectionDraft: (section: AdminSection) => void
  onDirtyChange: (isDirty: boolean) => void
}

export function SidebarEditor({
  selection,
  settings,
  sections,
  isConfirmingLeave,
  onBack,
  onConfirmLeave,
  onCancelLeave,
  onSettingsDraft,
  onSectionDraft,
  onDirtyChange,
}: Props) {
  const section = selection.kind === 'section' ? sections.find((item) => item.type === selection.type) : undefined
  const title = selection.kind === 'settings' ? 'Business info' : SECTION_META[selection.type].label

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b-2 border-ink/15 px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full text-sm font-semibold text-ink/75 underline-offset-4 hover:text-ink hover:underline"
        >
          <span aria-hidden="true">← </span>All sections
        </button>
        <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
        {section && !section.isVisible && (
          <p className="mt-1 text-sm text-ink/70">Hidden on the website. Edits are saved but not shown until you show it.</p>
        )}
        {isConfirmingLeave && <LeavePrompt onDiscard={onConfirmLeave} onKeepEditing={onCancelLeave} />}
      </div>

      {selection.kind === 'settings' && (
        <SiteSettingsForm settings={settings} onDraftChange={onSettingsDraft} onDirtyChange={onDirtyChange} />
      )}
      {section && (
        <SectionEditor
          key={section.type}
          section={section}
          onDraftChange={onSectionDraft}
          onDirtyChange={onDirtyChange}
        />
      )}
      {selection.kind === 'section' && !section && (
        <p role="alert" className="px-5 py-5">
          This section couldn't be found. Go back and pick another one.
        </p>
      )}
    </div>
  )
}
