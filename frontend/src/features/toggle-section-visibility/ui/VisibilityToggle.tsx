import { ALWAYS_VISIBLE_SECTIONS, type AdminSection, SECTION_META, SECTION_TYPES, type SectionType } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'

import { useSetSectionVisibility } from '../model/useSetSectionVisibility'

// Why a section can't be hidden, shown next to its disabled button.
const ALWAYS_VISIBLE_REASONS: Partial<Record<SectionType, string>> = {
  [SECTION_TYPES.hero]: 'Always shown: the page starts here.',
  [SECTION_TYPES.booking]: 'Always shown: every Book button leads here.',
}

const BUTTON_CLASSES =
  'rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/30 disabled:text-ink/40 disabled:hover:bg-transparent'

type Props = {
  section: AdminSection
}

export function VisibilityToggle({ section }: Props) {
  const toggle = useSetSectionVisibility()

  const label = SECTION_META[section.type].label
  const isLocked = ALWAYS_VISIBLE_SECTIONS.has(section.type)
  const reasonId = `visibility-reason-${section.type}`

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => toggle.mutate({ type: section.type, isVisible: !section.isVisible })}
        disabled={isLocked || toggle.isPending}
        aria-describedby={isLocked ? reasonId : undefined}
        className={BUTTON_CLASSES}
      >
        {section.isVisible ? 'Hide' : 'Show'}
        <span className="sr-only"> {label}</span>
      </button>
      {isLocked && (
        <p id={reasonId} className="text-xs text-ink/65">
          {ALWAYS_VISIBLE_REASONS[section.type]}
        </p>
      )}
      {toggle.isError && (
        <p role="alert" className="text-xs font-semibold text-cherry-deep">
          {saveErrorMessage(toggle.error)}
        </p>
      )}
    </div>
  )
}
