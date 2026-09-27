import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { type AdminSection, type SiteSettings, useAdminSections, useAdminSiteSettings } from '@/entities/site'
import { MEDIA_QUERIES, useMediaQuery } from '@/shared/lib'
import { buttonClasses } from '@/shared/ui'
import { type PreviewDraft, type PreviewFocus, SitePreviewPane } from '@/widgets/site-preview'

import type { BuilderSelection } from '../model/selection'
import { SidebarEditor } from './SidebarEditor'
import { SidebarList } from './SidebarList'

// Warns before the tab is closed or reloaded with unsaved edits.
function useUnloadWarning(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return undefined
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])
}

function LoadState({ isPending, onRetry }: { isPending: boolean; onRetry: () => void }) {
  if (isPending) {
    return (
      <p role="status" className="px-5 py-5">
        Loading the website content…
      </p>
    )
  }
  return (
    <div role="alert" className="space-y-3 px-5 py-5">
      <p>Couldn't load the website content.</p>
      <button type="button" onClick={onRetry} className={buttonClasses('secondary')}>
        Try again
      </button>
    </div>
  )
}

const SHOW_PREVIEW_CLASSES = 'rounded-full border-2 border-ink px-3 py-1 text-sm font-bold hover:bg-butter'

export function AdminWebsitePage() {
  const settingsQuery = useAdminSiteSettings()
  const sectionsQuery = useAdminSections()
  const isDesktop = useMediaQuery(MEDIA_QUERIES.desktop)

  const [selection, setSelection] = useState<BuilderSelection | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null)
  const [sectionDraft, setSectionDraft] = useState<AdminSection | null>(null)
  const [focus, setFocus] = useState<PreviewFocus | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const focusCount = useRef(0)
  useUnloadWarning(isDirty)

  const onDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), [])

  function open(next: BuilderSelection) {
    setSelection(next)
    setIsDirty(false)
    setSettingsDraft(null)
    setSectionDraft(null)
    if (next.kind === 'section') {
      focusCount.current += 1
      setFocus({ sectionType: next.type, nonce: focusCount.current })
    }
  }

  function close() {
    setSelection(null)
    setIsDirty(false)
    setIsConfirmingLeave(false)
    setSettingsDraft(null)
    setSectionDraft(null)
  }

  function back() {
    if (isDirty) setIsConfirmingLeave(true)
    else close()
  }

  const settings = settingsQuery.data
  const sections = sectionsQuery.data
  const draft: PreviewDraft | null =
    settings && sections
      ? {
          settings: settingsDraft ?? settings,
          sections: sections.map((section) => (sectionDraft?.type === section.type ? sectionDraft : section)),
        }
      : null

  const openPreviewButton = !isDesktop && (
    <button type="button" onClick={() => setIsPreviewOpen(true)} className={SHOW_PREVIEW_CLASSES}>
      Show preview
    </button>
  )

  function renderSidebarBody() {
    if (!settings || !sections) {
      const isPending = settingsQuery.isPending || sectionsQuery.isPending
      return (
        <LoadState
          isPending={isPending}
          onRetry={() => {
            void settingsQuery.refetch()
            void sectionsQuery.refetch()
          }}
        />
      )
    }
    if (!selection) return <SidebarList settings={settings} sections={sections} onOpen={open} />
    return (
      <SidebarEditor
        selection={selection}
        settings={settings}
        sections={sections}
        isConfirmingLeave={isConfirmingLeave}
        onBack={back}
        onConfirmLeave={close}
        onCancelLeave={() => setIsConfirmingLeave(false)}
        onSettingsDraft={setSettingsDraft}
        onSectionDraft={setSectionDraft}
        onDirtyChange={onDirtyChange}
      />
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <aside
        aria-label="Website editor"
        className="relative flex min-h-0 w-full flex-col border-ink bg-white lg:w-100 lg:shrink-0 lg:border-r-4"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-ink/15 px-5 py-3">
          <div>
            <h1 className="font-display text-3xl text-ink">Website</h1>
            <p className="text-sm text-ink/70">Changes go live when you save.</p>
          </div>
          {openPreviewButton}
        </div>
        {renderSidebarBody()}
      </aside>

      {isDesktop && <SitePreviewPane draft={draft} focus={focus} hasUnsavedChanges={isDirty} />}

      {!isDesktop && isPreviewOpen && (
        <PreviewOverlay onClose={() => setIsPreviewOpen(false)}>
          <SitePreviewPane
            draft={draft}
            focus={focus}
            hasUnsavedChanges={isDirty}
            onClose={() => setIsPreviewOpen(false)}
          />
        </PreviewOverlay>
      )}
    </div>
  )
}

function PreviewOverlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label="Website preview" className="fixed inset-0 z-50 flex flex-col bg-kernel">
      {children}
    </div>
  )
}
