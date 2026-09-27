import { useState } from 'react'

const COPIED_RESET_MS = 2500

type Props = {
  text: string
  label: string
  className?: string
}

// Copies `text` and confirms it. When the clipboard is blocked, shows the text to copy by hand.
export function CopyButton({ text, label, className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), COPIED_RESET_MS)
  }

  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={copy} className={className}>
        {state === 'copied' ? 'Copied!' : label}
      </button>
      <span role="status" className="sr-only">
        {state === 'copied' ? 'Link copied' : ''}
      </span>
      {state === 'failed' && <span className="mt-1 max-w-72 text-xs break-all">Copy this link: {text}</span>}
    </span>
  )
}
