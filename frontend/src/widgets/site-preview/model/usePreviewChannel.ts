import { type RefObject, useEffect, useRef } from 'react'

import {
  type PreviewDraftMessage,
  type PreviewMessage,
  postPreviewMessage,
  PREVIEW_MESSAGE_TYPES,
  readPreviewMessage,
} from '@/entities/site'

export type PreviewDraft = Omit<PreviewDraftMessage, 'type'>

// A section to bring into view. The nonce makes picking the same section again scroll again.
export type PreviewFocus = { sectionId: number; nonce: number }

// Keeps the /preview iframe in sync: sends the draft on every change and whenever the
// iframe (re)loads and says it's ready, and scrolls it to the focused section.
export function usePreviewChannel(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  draft: PreviewDraft | null,
  focus: PreviewFocus | null,
): void {
  const latest = useRef({ draft, focus })

  useEffect(() => {
    latest.current = { draft, focus }
  }, [draft, focus])

  useEffect(() => {
    function send(message: PreviewMessage) {
      const target = iframeRef.current?.contentWindow
      if (target) postPreviewMessage(target, message)
    }

    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== iframeRef.current?.contentWindow) return
      const message = readPreviewMessage(event)
      if (message?.type !== PREVIEW_MESSAGE_TYPES.ready) return
      const { draft: currentDraft, focus: currentFocus } = latest.current
      if (currentDraft) send({ type: PREVIEW_MESSAGE_TYPES.draft, ...currentDraft })
      if (currentFocus) send({ type: PREVIEW_MESSAGE_TYPES.scroll, sectionId: currentFocus.sectionId })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [iframeRef])

  useEffect(() => {
    const target = iframeRef.current?.contentWindow
    if (target && draft) postPreviewMessage(target, { type: PREVIEW_MESSAGE_TYPES.draft, ...draft })
  }, [iframeRef, draft])

  useEffect(() => {
    const target = iframeRef.current?.contentWindow
    if (target && focus) postPreviewMessage(target, { type: PREVIEW_MESSAGE_TYPES.scroll, sectionId: focus.sectionId })
  }, [iframeRef, focus])
}
