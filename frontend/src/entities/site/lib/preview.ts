import { type AdminSection, SECTION_TYPES, type Site, type SiteSection, type SiteSettings, type Theme } from '../model/types'

// Messages between the admin website builder and the /preview page it shows in an iframe.
// Both are same-origin; receivers must check event.origin === window.location.origin.
export const PREVIEW_MESSAGE_TYPES = {
  // builder -> preview: render this (unsaved) site
  draft: 'rpw-preview-draft',
  // builder -> preview: bring this section into view
  scroll: 'rpw-preview-scroll',
  // preview -> builder: listening now, (re)send the draft
  ready: 'rpw-preview-ready',
} as const

export type PreviewDraftMessage = {
  type: typeof PREVIEW_MESSAGE_TYPES.draft
  settings: SiteSettings
  theme: Theme
  sections: AdminSection[]
}

export type PreviewScrollMessage = {
  type: typeof PREVIEW_MESSAGE_TYPES.scroll
  sectionId: number
}

export type PreviewReadyMessage = {
  type: typeof PREVIEW_MESSAGE_TYPES.ready
}

export type PreviewMessage = PreviewDraftMessage | PreviewScrollMessage | PreviewReadyMessage

const MESSAGE_TYPE_VALUES: ReadonlySet<unknown> = new Set(Object.values(PREVIEW_MESSAGE_TYPES))

// Reads a postMessage event: only same-origin messages of our known types are accepted.
export function readPreviewMessage(event: MessageEvent<unknown>): PreviewMessage | null {
  if (event.origin !== window.location.origin) return null
  const { data } = event
  if (typeof data !== 'object' || data === null || !('type' in data)) return null
  if (!MESSAGE_TYPE_VALUES.has(data.type)) return null
  // Same-origin sender is our own app, so the payload shape can be trusted past the type check.
  return data as PreviewMessage
}

export function postPreviewMessage(target: Window, message: PreviewMessage): void {
  target.postMessage(message, window.location.origin)
}

// Mirrors the backend: a gallery with no photos yet isn't shown on the public page.
export function hasPublicContent(section: SiteSection): boolean {
  return !(section.type === SECTION_TYPES.gallery && section.content.images.length === 0)
}

// What the public page would show: visible sections with content, in display order.
export function siteFromDraft({ settings, theme, sections }: Omit<PreviewDraftMessage, 'type'>): Site {
  const visible: SiteSection[] = sections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.position - b.position)
    .filter(hasPublicContent)
  return { settings, theme, sections: visible }
}
