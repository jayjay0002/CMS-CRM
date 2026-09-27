import type { SectionType } from '@/entities/site'

// What the builder sidebar is editing.
export type BuilderSelection = { kind: 'settings' } | { kind: 'section'; type: SectionType }
