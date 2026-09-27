import { useEffect, useRef } from 'react'

import { type AdminSection, sectionTitle, type SiteSettings, type Theme } from '@/entities/site'
import { DeleteSectionButton } from '@/features/delete-section'
import { SectionEditor } from '@/features/edit-section'
import { SiteSettingsForm } from '@/features/edit-site-settings'
import { ThemeEditor } from '@/features/edit-theme'

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

function titleFor(selection: BuilderSelection, section: AdminSection | undefined): string {
  if (selection.kind === 'theme') return 'Theme'
  if (selection.kind === 'settings') return 'Business info'
  return section ? sectionTitle(section) : 'Section'
}

type Props = {
  selection: BuilderSelection
  settings: SiteSettings
  theme: Theme
  sections: readonly AdminSection[]
  // The sections list is refreshing (e.g. right after adding one).
  isRefreshing: boolean
  isConfirmingLeave: boolean
  onBack: () => void
  onConfirmLeave: () => void
  onCancelLeave: () => void
  onSettingsDraft: (settings: SiteSettings) => void
  onThemeDraft: (theme: Theme) => void
  onSectionDraft: (section: AdminSection) => void
  onDirtyChange: (isDirty: boolean) => void
  onDeleted: () => void
}

export function SidebarEditor({
  selection,
  settings,
  theme,
  sections,
  isRefreshing,
  isConfirmingLeave,
  onBack,
  onConfirmLeave,
  onCancelLeave,
  onSettingsDraft,
  onThemeDraft,
  onSectionDraft,
  onDirtyChange,
  onDeleted,
}: Props) {
  const section = selection.kind === 'section' ? sections.find((item) => item.id === selection.id) : undefined

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
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl text-ink">{titleFor(selection, section)}</h2>
          {section && <DeleteSectionButton section={section} onDeleted={onDeleted} />}
        </div>
        {selection.kind === 'theme' && (
          <p className="mt-1 text-sm text-ink/70">Colors and fonts for the public website. The admin panel keeps its own look.</p>
        )}
        {section && !section.isVisible && (
          <p className="mt-1 text-sm text-ink/70">Hidden on the website. Edits are saved but not shown until you show it.</p>
        )}
        {isConfirmingLeave && <LeavePrompt onDiscard={onConfirmLeave} onKeepEditing={onCancelLeave} />}
      </div>

      {selection.kind === 'theme' && (
        <ThemeEditor theme={theme} onDraftChange={onThemeDraft} onDirtyChange={onDirtyChange} />
      )}
      {selection.kind === 'settings' && (
        <SiteSettingsForm settings={settings} onDraftChange={onSettingsDraft} onDirtyChange={onDirtyChange} />
      )}
      {section && (
        <SectionEditor key={section.id} section={section} onDraftChange={onSectionDraft} onDirtyChange={onDirtyChange} />
      )}
      {selection.kind === 'section' && !section && (
        <p role={isRefreshing ? 'status' : 'alert'} className="px-5 py-5">
          {isRefreshing ? 'Loading the section…' : 'This section couldn’t be found. Go back and pick another one.'}
        </p>
      )}
    </div>
  )
}
