import type { ReactNode } from 'react'

import { type AdminSection, sectionSummary, sectionTitle, type SiteSettings, type Theme } from '@/entities/site'
import { AddSectionMenu } from '@/features/add-section'
import { DeleteSectionButton } from '@/features/delete-section'
import { SortableSectionList } from '@/features/reorder-sections'
import { VisibilityToggle } from '@/features/toggle-section-visibility'

import type { BuilderSelection } from '../model/selection'

function VisibilityBadge({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <span className="rounded-full bg-butter px-2 py-0.5 text-xs font-bold text-ink">Visible</span>
  ) : (
    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-bold text-ink/70">Hidden</span>
  )
}

const OPEN_BUTTON_CLASSES =
  'group min-w-0 flex-1 rounded-xl px-2 py-1.5 text-left hover:bg-butter-soft focus-visible:bg-butter-soft'

function OpenLabel({ title, summary, badge }: { title: string; summary: ReactNode; badge?: ReactNode }) {
  return (
    <>
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-bold group-hover:underline">{title}</span>
        {badge}
      </span>
      <span className="mt-0.5 block truncate text-sm text-ink/65">{summary}</span>
    </>
  )
}

function ThemeSwatches({ theme }: { theme: Theme }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="flex">
        {Object.values(theme.colors).map((color, index) => (
          <span
            key={`${index}-${color}`}
            className="-ml-1 size-4 rounded-full border-2 border-white first:ml-0"
            // Shows a stored color, so it can't be a static class.
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      {theme.headingFont} + {theme.bodyFont}
    </span>
  )
}

const PINNED_ROW_CLASSES = 'flex items-center rounded-2xl border-2 border-ink/15 bg-kernel p-2'

type Props = {
  settings: SiteSettings
  theme: Theme
  sections: readonly AdminSection[]
  onOpen: (selection: BuilderSelection) => void
}

export function SidebarList({ settings, theme, sections, onOpen }: Props) {
  return (
    <div className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold text-ink/70">Across the site</h2>
        <div className="space-y-2">
          <div className={PINNED_ROW_CLASSES}>
            <button type="button" onClick={() => onOpen({ kind: 'theme' })} className={OPEN_BUTTON_CLASSES}>
              <OpenLabel title="Theme" summary={<ThemeSwatches theme={theme} />} />
            </button>
          </div>
          <div className={PINNED_ROW_CLASSES}>
            <button type="button" onClick={() => onOpen({ kind: 'settings' })} className={OPEN_BUTTON_CLASSES}>
              <OpenLabel title="Business info" summary={`${settings.businessName}, ${settings.phoneDisplay}`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 px-1 text-sm font-bold text-ink/70">Page sections, top to bottom</h2>
        <p className="mb-2 px-1 text-xs text-ink/60">Drag the ⠿ handle, or use the arrows, to change the order.</p>
        <SortableSectionList
          sections={sections}
          renderDragPreview={(section) => <DragPreview section={section} />}
          renderRow={(section, { dragHandle, moveButtons }) => (
            <div
              className={`flex flex-wrap items-center gap-1 rounded-2xl border-2 p-2 ${section.isVisible ? 'border-ink/15 bg-kernel' : 'border-dashed border-ink/25 bg-white'}`}
            >
              {dragHandle}
              <button
                type="button"
                onClick={() => onOpen({ kind: 'section', id: section.id })}
                className={OPEN_BUTTON_CLASSES}
              >
                <OpenLabel
                  title={sectionTitle(section)}
                  summary={sectionSummary(section)}
                  badge={<VisibilityBadge isVisible={section.isVisible} />}
                />
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {moveButtons}
                <div className="flex gap-1.5">
                  <DeleteSectionButton section={section} />
                  <VisibilityToggle section={section} />
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <AddSectionMenu onAdded={(section) => onOpen({ kind: 'section', id: section.id })} />
    </div>
  )
}

function DragPreview({ section }: { section: AdminSection }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-butter-soft p-3 shadow-sign">
      <span aria-hidden="true" className="text-lg">
        ⠿
      </span>
      <span className="font-bold">{sectionTitle(section)}</span>
    </div>
  )
}
