import { type AdminSection, SECTION_TYPES, type SiteSection } from '@/entities/site'
import type { SaveStatus } from '@/shared/ui'

import { useUpdateSectionContent } from '../model/useUpdateSectionContent'
import { EventTypesForm } from './EventTypesForm'
import { FaqForm } from './FaqForm'
import { FlavorsForm } from './FlavorsForm'
import { HeroForm } from './HeroForm'
import { HowItWorksForm } from './HowItWorksForm'
import { BookingSectionForm, PackagesMenuForm } from './SimpleSectionForms'

type Props = {
  section: AdminSection
  // The section with its unsaved content, on every edit (for the live preview).
  onDraftChange?: (draft: AdminSection) => void
  onDirtyChange?: (isDirty: boolean) => void
}

// Picks the form for the section's type; each form edits that type's content.
export function SectionEditor({ section, onDraftChange, onDirtyChange }: Props) {
  const update = useUpdateSectionContent()
  const status: SaveStatus = { isPending: update.isPending, isSuccess: update.isSuccess, error: update.error }

  function save(next: SiteSection, onSaved: () => void) {
    update.mutate(next, { onSuccess: onSaved })
  }

  const common = { status, onDirtyChange }

  switch (section.type) {
    case SECTION_TYPES.hero:
      return (
        <HeroForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.eventTypes:
      return (
        <EventTypesForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.packagesMenu:
      return (
        <PackagesMenuForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.howItWorks:
      return (
        <HowItWorksForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.flavors:
      return (
        <FlavorsForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.faq:
      return (
        <FaqForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
    case SECTION_TYPES.booking:
      return (
        <BookingSectionForm
          {...common}
          content={section.content}
          onSave={(content, onSaved) => save({ type: section.type, content }, onSaved)}
          onDraftChange={(content) => onDraftChange?.({ ...section, content })}
        />
      )
  }
}
