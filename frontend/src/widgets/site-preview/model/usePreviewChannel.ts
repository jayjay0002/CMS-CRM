import { type RefObject, useEffect, useRef } from 'react'

import {
  type PreviewDraftMessage,
  type PreviewMessage,
  type PreviewMoveSectionMessage,
  postPreviewMessage,
  PREVIEW_MESSAGE_TYPES,
  readPreviewMessage,
} from '@/entities/site'

export type PreviewDraft = Omit<PreviewDraftMessage, 'type'>

// A section to bring into view. The nonce makes picking the same section again scroll again.
export type PreviewFocus = { sectionId: number; nonce: number }

export type PreviewSectionMove = Omit<PreviewMoveSectionMessage, 'type'>

// Keeps the /preview iframe in sync: sends the draft on every change and whenever the
// iframe (re)loads and says it's ready, and scrolls it to the focused section. Sections the
// admin drags in the preview come back through `onMoveSection`.
export function usePreviewChannel(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  draft: PreviewDraft | null,
  focus: PreviewFocus | null,
  onMoveSection: (move: PreviewSectionMove) => void,
): void {
  const latest = useRef({ draft, focus, onMoveSection })

  useEffect(() => {
    latest.current = { draft, focus, onMoveSection }
  }, [draft, focus, onMoveSection])

  useEffect(() => {
    function send(message: PreviewMessage) {
      const target = iframeRef.current?.contentWindow
      if (target) postPreviewMessage(target, message)
    }

    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== iframeRef.current?.contentWindow) return
      const message = readPreviewMessage(event)
      if (message?.type === PREVIEW_MESSAGE_TYPES.moveSection) {
        latest.current.onMoveSection({ sectionId: message.sectionId, beforeSectionId: message.beforeSectionId })
        return
      }
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
