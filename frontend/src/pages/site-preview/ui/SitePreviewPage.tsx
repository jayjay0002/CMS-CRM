import { useEffect, useRef, useState } from 'react'

import {
  postPreviewMessage,
  PREVIEW_MESSAGE_TYPES,
  readPreviewMessage,
  type Site,
  siteFromDraft,
  useSite,
} from '@/entities/site'
import { ArrangeableSection, type DropTarget, SectionArranger } from '@/features/arrange-preview-sections'
import { LandingPage, LandingPageError, LandingPageLoading } from '@/widgets/landing-page'

import { scrollToAndHighlight } from '../lib/highlightSection'

const PREVIEW_TITLE = 'Preview'

// Keeps search engines away if the (unlinked) URL is ever shared.
function useNoIndex(): void {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    const previousTitle = document.title
    document.title = `${PREVIEW_TITLE} | ${previousTitle}`
    return () => {
      meta.remove()
      document.title = previousTitle
    }
  }, [])
}

// Only inside the builder: moves are saved by the builder, so there's no one to send them to otherwise.
const isInBuilder = window.parent !== window

function sendMove(sectionId: number, { beforeId }: DropTarget): void {
  postPreviewMessage(window.parent, { type: PREVIEW_MESSAGE_TYPES.moveSection, sectionId, beforeSectionId: beforeId })
}

// The landing page as the website builder shows it: live drafts from the builder (same origin),
// or the saved content when opened on its own. In the builder, sections can be dragged to reorder.
export function SitePreviewPage() {
  const saved = useSite()
  const [draft, setDraft] = useState<Site | null>(null)
  // A section asked for before it was rendered (e.g. one just added); scrolled to after the next draft.
  const pendingScroll = useRef<number | null>(null)
  useNoIndex()

  useEffect(() => {
    function onMessage(event: MessageEvent<unknown>) {
      const message = readPreviewMessage(event)
      if (!message) return
      if (message.type === PREVIEW_MESSAGE_TYPES.draft) setDraft(siteFromDraft(message))
      if (message.type === PREVIEW_MESSAGE_TYPES.scroll && !scrollToAndHighlight(message.sectionId)) {
        pendingScroll.current = message.sectionId
      }
    }

    window.addEventListener('message', onMessage)
    // Tell the builder we're listening so it (re)sends the current draft.
    if (isInBuilder) postPreviewMessage(window.parent, { type: PREVIEW_MESSAGE_TYPES.ready })
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (pendingScroll.current !== null && scrollToAndHighlight(pendingScroll.current)) pendingScroll.current = null
  }, [draft])

  const site = draft ?? saved.data
  if (site && !isInBuilder) return <LandingPage site={site} isPreview />
  if (site) {
    return (
      <SectionArranger sections={site.sections} onMove={sendMove}>
        <LandingPage
          site={site}
          isPreview
          renderSectionFrame={(section, children) => <ArrangeableSection section={section}>{children}</ArrangeableSection>}
        />
      </SectionArranger>
    )
  }
  if (saved.isError) return <LandingPageError onRetry={() => saved.refetch()} isRetrying={saved.isRefetching} />
  return <LandingPageLoading />
}
