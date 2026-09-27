import type { ReactNode } from 'react'

import { type AdminSection, SECTION_META, type SectionType, sectionSummary, type SiteSettings } from '@/entities/site'
import { MoveSectionButtons } from '@/features/reorder-sections'
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

function OpenLabel({ title, summary, badge }: { title: string; summary: string; badge?: ReactNode }) {
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

type Props = {
  settings: SiteSettings
  sections: readonly AdminSection[]
  onOpen: (selection: BuilderSelection) => void
}

export function SidebarList({ settings, sections, onOpen }: Props) {
  return (
    <div className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
      <div>
        <h2 className="mb-2 px-1 text-sm font-bold text-ink/70">Across the site</h2>
        <div className="flex items-center rounded-2xl border-2 border-ink/15 bg-kernel p-2">
          <button type="button" onClick={() => onOpen({ kind: 'settings' })} className={OPEN_BUTTON_CLASSES}>
            <OpenLabel title="Business info" summary={`${settings.businessName}, ${settings.phoneDisplay}`} />
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-1 text-sm font-bold text-ink/70">Page sections, top to bottom</h2>
        <ol className="space-y-2">
          {sections.map((section, index) => (
            <SectionRow key={section.type} sections={sections} index={index} onOpen={onOpen} />
          ))}
        </ol>
      </div>
    </div>
  )
}

type SectionRowProps = {
  sections: readonly AdminSection[]
  index: number
  onOpen: (selection: BuilderSelection) => void
}

function SectionRow({ sections, index, onOpen }: SectionRowProps) {
  const section = sections[index]
  if (!section) return null
  const type: SectionType = section.type

  return (
    <li
      className={`flex items-center gap-2 rounded-2xl border-2 p-2 ${section.isVisible ? 'border-ink/15 bg-kernel' : 'border-dashed border-ink/25 bg-white'}`}
    >
      <button type="button" onClick={() => onOpen({ kind: 'section', type })} className={OPEN_BUTTON_CLASSES}>
        <OpenLabel
          title={SECTION_META[type].label}
          summary={sectionSummary(section)}
          badge={<VisibilityBadge isVisible={section.isVisible} />}
        />
      </button>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <MoveSectionButtons sections={sections} index={index} />
        <VisibilityToggle section={section} />
      </div>
    </li>
  )
}
