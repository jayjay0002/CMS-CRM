import { type ReactNode, useState } from 'react'

import {
  type AdminSection,
  SECTION_META,
  type SectionType,
  sectionSummary,
  useAdminSections,
  useAdminSiteSettings,
} from '@/entities/site'
import { SectionEditor } from '@/features/edit-section'
import { SiteSettingsForm } from '@/features/edit-site-settings'
import { MoveSectionButtons } from '@/features/reorder-sections'
import { VisibilityToggle } from '@/features/toggle-section-visibility'
import { ROUTES } from '@/shared/config'
import { buttonClasses } from '@/shared/ui'

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="mt-1 mb-6 text-ink/70">{description}</p>
      {children}
    </section>
  )
}

function LoadState({ isPending, onRetry, what }: { isPending: boolean; onRetry: () => void; what: string }) {
  if (isPending) return <p role="status">Loading {what}…</p>
  return (
    <div role="alert" className="space-y-3">
      <p>{`Couldn't load ${what}.`}</p>
      <button type="button" onClick={onRetry} className={buttonClasses('secondary')}>
        Try again
      </button>
    </div>
  )
}

function VisibilityBadge({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <span className="rounded-full bg-butter px-2.5 py-0.5 text-xs font-bold text-ink">Visible</span>
  ) : (
    <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-bold text-ink/70">Hidden</span>
  )
}

type SectionRowProps = {
  sections: readonly AdminSection[]
  index: number
  isEditing: boolean
  onToggleEdit: () => void
}

function SectionRow({ sections, index, isEditing, onToggleEdit }: SectionRowProps) {
  const section = sections[index]
  if (!section) return null
  const { label } = SECTION_META[section.type]
  const editorId = `editor-${section.type}`

  return (
    <li className="rounded-2xl border-2 border-ink/15 bg-kernel p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{label}</h3>
            <VisibilityBadge isVisible={section.isVisible} />
          </div>
          <p className="mt-1 truncate text-ink/70">{sectionSummary(section)}</p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <button
            type="button"
            onClick={onToggleEdit}
            aria-expanded={isEditing}
            aria-controls={editorId}
            className="rounded-full border-2 border-ink bg-ink px-4 py-1.5 text-sm font-semibold text-kernel hover:bg-ink/85"
          >
            {isEditing ? 'Close' : 'Edit'}
            <span className="sr-only"> {label}</span>
          </button>
          <VisibilityToggle section={section} />
          <MoveSectionButtons sections={sections} index={index} />
        </div>
      </div>
      {isEditing && (
        <div id={editorId} className="mt-5 border-t-2 border-ink/10 pt-5">
          <SectionEditor section={section} onClose={onToggleEdit} />
        </div>
      )}
    </li>
  )
}

export function AdminWebsitePage() {
  const settingsQuery = useAdminSiteSettings()
  const sectionsQuery = useAdminSections()
  const [editingType, setEditingType] = useState<SectionType | null>(null)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink md:text-5xl">Website</h1>
          <p className="mt-2 text-ink/75">Changes go live on the website as soon as you save.</p>
        </div>
        <a href={ROUTES.home} target="_blank" rel="noreferrer" className={buttonClasses('secondary')}>
          View site<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      <Panel title="Business info" description="Name, contact details and service area, shown across the site.">
        {settingsQuery.data ? (
          <SiteSettingsForm settings={settingsQuery.data} />
        ) : (
          <LoadState isPending={settingsQuery.isPending} onRetry={() => settingsQuery.refetch()} what="business info" />
        )}
      </Panel>

      <Panel title="Page sections" description="Edit each section, hide the ones you don't need, or change their order.">
        {sectionsQuery.data ? (
          <ol className="space-y-3">
            {sectionsQuery.data.map((section, index) => (
              <SectionRow
                key={section.type}
                sections={sectionsQuery.data}
                index={index}
                isEditing={editingType === section.type}
                onToggleEdit={() => setEditingType((current) => (current === section.type ? null : section.type))}
              />
            ))}
          </ol>
        ) : (
          <LoadState isPending={sectionsQuery.isPending} onRetry={() => sectionsQuery.refetch()} what="the sections" />
        )}
      </Panel>
    </div>
  )
}
