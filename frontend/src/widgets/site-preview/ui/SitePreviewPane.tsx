import { useRef, useState } from 'react'

import { ROUTES } from '@/shared/config'

import { useElementSize } from '../lib/useElementSize'
import { type PreviewDraft, type PreviewFocus, usePreviewChannel } from '../model/usePreviewChannel'

// The page is rendered at a real device width, then scaled down to fit the pane.
const DEVICES = {
  desktop: { label: 'Desktop', width: 1280 },
  mobile: { label: 'Mobile', width: 390 },
} as const

type Device = keyof typeof DEVICES

const DEVICE_ORDER: readonly Device[] = ['desktop', 'mobile']
const MAX_SCALE = 1

function toggleClasses(isActive: boolean): string {
  const base = 'rounded-full px-3 py-1 text-sm font-bold transition-colors'
  return isActive ? `${base} bg-ink text-kernel` : `${base} text-ink/70 hover:bg-ink/10`
}

type Props = {
  draft: PreviewDraft | null
  focus: PreviewFocus | null
  // Whether the preview currently shows edits that aren't saved yet.
  hasUnsavedChanges: boolean
  // Shown as a "Close preview" button when the pane is an overlay (small screens).
  onClose?: () => void
}

export function SitePreviewPane({ draft, focus, hasUnsavedChanges, onClose }: Props) {
  const [device, setDevice] = useState<Device>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const viewport = useElementSize(viewportRef)
  usePreviewChannel(iframeRef, draft, focus)

  const { width } = DEVICES[device]
  const scale = viewport.width > 0 ? Math.min(MAX_SCALE, viewport.width / width) : MAX_SCALE
  const frameHeight = viewport.height / scale
  const siteAddress = `${window.location.host}${ROUTES.home}`

  return (
    <section aria-label="Website preview" className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink/5">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b-2 border-ink/15 bg-kernel px-4 py-2.5">
        <div role="group" aria-label="Preview size" className="flex rounded-full border-2 border-ink p-0.5">
          {DEVICE_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={device === option}
              onClick={() => setDevice(option)}
              className={toggleClasses(device === option)}
            >
              {DEVICES[option].label}
            </button>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate rounded-full bg-ink/5 px-3 py-1 text-sm text-ink/70">
          <span className="sr-only">Page address: </span>
          {siteAddress}
          {hasUnsavedChanges && (
            <span className="ml-2 rounded-full bg-butter px-2 py-0.5 text-xs font-bold text-ink">
              Showing unsaved changes
            </span>
          )}
        </p>
        <a
          href={ROUTES.home}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold underline decoration-cherry decoration-2 underline-offset-4"
        >
          Open live site<span className="sr-only"> (opens in a new tab)</span>
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-ink px-3 py-1 text-sm font-bold hover:bg-butter"
          >
            Close preview
          </button>
        )}
      </div>

      <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden p-4">
        <div
          className={`mx-auto overflow-hidden bg-white shadow-sign ${device === 'mobile' ? 'rounded-3xl border-4 border-ink' : 'rounded-xl border-2 border-ink'}`}
          // Sizes follow the measured pane, so they can't be static classes.
          style={{ width: width * scale, height: viewport.height }}
        >
          <iframe
            ref={iframeRef}
            src={ROUTES.sitePreview}
            title="Preview of the website with your unsaved changes"
            className="block origin-top-left border-0"
            style={{ width, height: frameHeight, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </section>
  )
}
