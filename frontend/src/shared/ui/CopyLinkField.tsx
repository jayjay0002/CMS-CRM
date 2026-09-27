import { useId, useRef, useState } from 'react'

import { buttonClasses } from './buttonStyles'
import { INPUT_CLASSES } from './fieldStyles'

const COPIED_RESET_MS = 2500

const COPY_STATES = {
  idle: 'idle',
  copied: 'copied',
  // Clipboard blocked: the text is selected for a manual copy.
  selected: 'selected',
} as const

type CopyState = (typeof COPY_STATES)[keyof typeof COPY_STATES]

type Props = {
  link: string
  // Screen-reader label for the read-only field, e.g. "Proposal link".
  label: string
}

async function copyText(text: string, fallbackInput: HTMLInputElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API blocked (insecure context, permissions): select the text so Ctrl+C works.
    fallbackInput?.select()
    return false
  }
}

// A read-only link with a Copy button.
export function CopyLinkField({ link, label }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [copyState, setCopyState] = useState<CopyState>(COPY_STATES.idle)

  async function handleCopy() {
    const copied = await copyText(link, inputRef.current)
    setCopyState(copied ? COPY_STATES.copied : COPY_STATES.selected)
    window.setTimeout(() => setCopyState(COPY_STATES.idle), COPIED_RESET_MS)
  }

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          ref={inputRef}
          readOnly
          value={link}
          onFocus={(event) => event.currentTarget.select()}
          className={`${INPUT_CLASSES} font-mono text-sm`}
        />
        <button type="button" onClick={handleCopy} className={buttonClasses('primary', 'shrink-0 px-5 py-2')}>
          {copyState === COPY_STATES.copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm text-ink/75">
        {copyState === COPY_STATES.selected && 'Link selected. Press Ctrl+C (or ⌘C) to copy it.'}
      </p>
    </div>
  )
}
