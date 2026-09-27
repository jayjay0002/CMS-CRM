import type { ReactNode } from 'react'

import { type AdminSection, SECTION_TYPES, type SectionContentMap, type SectionType, type SiteSection } from '@/entities/site'
import type { SaveStatus } from '@/shared/ui'

import type { SectionFormProps } from '../model/types'
import { useUpdateSectionContent } from '../model/useUpdateSectionContent'
import { CtaForm, GalleryForm, StoryForm, TextForm } from './CustomSectionForms'
import { EventTypesForm } from './EventTypesForm'
import { FaqForm } from './FaqForm'
import { FlavorsForm } from './FlavorsForm'
import { HeroForm } from './HeroForm'
import { HowItWorksForm } from './HowItWorksForm'
import { BookingSectionForm, PackagesMenuForm } from './SimpleSectionForms'

type FormComponent<T extends SectionType> = (props: SectionFormProps<SectionContentMap[T]>) => ReactNode

const SECTION_FORMS: { [T in SectionType]: FormComponent<T> } = {
  [SECTION_TYPES.hero]: HeroForm,
  [SECTION_TYPES.eventTypes]: EventTypesForm,
  [SECTION_TYPES.packagesMenu]: PackagesMenuForm,
  [SECTION_TYPES.howItWorks]: HowItWorksForm,
  [SECTION_TYPES.flavors]: FlavorsForm,
  [SECTION_TYPES.faq]: FaqForm,
  [SECTION_TYPES.booking]: BookingSectionForm,
  [SECTION_TYPES.story]: StoryForm,
  [SECTION_TYPES.gallery]: GalleryForm,
  [SECTION_TYPES.text]: TextForm,
  [SECTION_TYPES.cta]: CtaForm,
}

type Props = {
  section: AdminSection
  // The section with its unsaved content, on every edit (for the live preview).
  onDraftChange?: (draft: AdminSection) => void
  onDirtyChange?: (isDirty: boolean) => void
}

function renderForm<T extends SectionType>(
  section: AdminSection<T>,
  props: Omit<SectionFormProps<SectionContentMap[T]>, 'content' | 'onDraftChange' | 'onSave'>,
  save: (next: SiteSection<T>, onSaved: () => void) => void,
  onDraftChange?: (draft: AdminSection) => void,
): ReactNode {
  const Form: FormComponent<T> = SECTION_FORMS[section.type]
  // Same-typed content always goes back with its own section, so these spreads stay type-correct.
  const withContent = (content: SectionContentMap[T]) => ({ ...section, content }) as AdminSection
  return (
    <Form
      {...props}
      content={section.content}
      onSave={(content, onSaved) => save({ id: section.id, type: section.type, content } as SiteSection<T>, onSaved)}
      onDraftChange={(content) => onDraftChange?.(withContent(content))}
    />
  )
}

// Picks the form for the section's type; each form edits that type's content.
export function SectionEditor({ section, onDraftChange, onDirtyChange }: Props) {
  const update = useUpdateSectionContent()
  const status: SaveStatus = { isPending: update.isPending, isSuccess: update.isSuccess, error: update.error }

  function save(next: SiteSection, onSaved: () => void) {
    update.mutate(next, { onSuccess: onSaved })
  }

  return renderForm(section, { status, onDirtyChange }, save, onDraftChange)
}
