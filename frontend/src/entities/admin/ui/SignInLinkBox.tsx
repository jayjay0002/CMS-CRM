import { useId, useRef, useState } from 'react'

import { buttonClasses, INPUT_CLASSES } from '@/shared/ui'

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
  recipientName: string
  onDismiss?: () => void
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

// A one-time sign-in link the owner sends to someone themselves (nothing is emailed).
export function SignInLinkBox({ link, recipientName, onDismiss }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [copyState, setCopyState] = useState<CopyState>(COPY_STATES.idle)

  async function handleCopy() {
    const copied = await copyText(link, inputRef.current)
    setCopyState(copied ? COPY_STATES.copied : COPY_STATES.selected)
    window.setTimeout(() => setCopyState(COPY_STATES.idle), COPIED_RESET_MS)
  }

  return (
    <div className="rounded-2xl border-2 border-ink bg-butter-soft p-4">
      <p className="font-semibold">
        Send this link to {recipientName}. It lets them set their own password. Nothing is emailed
        automatically.
      </p>
      <p className="mt-1 text-sm text-ink/75">
        The link works once and expires, so send it soon. You can get a new one from the list.
      </p>
      <label htmlFor={inputId} className="sr-only">
        Sign-in link for {recipientName}
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm font-semibold underline decoration-cherry decoration-2 underline-offset-4"
        >
          Done
        </button>
      )}
    </div>
  )
}
