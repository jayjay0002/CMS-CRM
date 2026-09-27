import { useEffect, useId, useRef, useState } from 'react'

import { type AdminSection, CUSTOM_SECTION_OPTIONS, type CustomSectionType, SECTION_META } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'

import { useAddSection } from '../model/useAddSection'

type Props = {
  // Called with the new section so the builder can open its editor.
  onAdded: (section: AdminSection) => void
}

// "+ Add section": a short menu of the section types the owner can add.
export function AddSectionMenu({ onAdded }: Props) {
  const add = useAddSection()
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const firstOptionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) firstOptionRef.current?.focus()
  }, [isOpen])

  function choose(type: CustomSectionType) {
    add.mutate(type, {
      onSuccess: (section) => {
        setIsOpen(false)
        onAdded(section)
      },
    })
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className="w-full rounded-2xl border-2 border-dashed border-ink px-4 py-3 text-left font-bold hover:bg-butter-soft"
      >
        <span aria-hidden="true">+ </span>Add section
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="group"
          aria-label="Choose a section to add"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false)
          }}
          className="space-y-2 rounded-2xl border-2 border-ink bg-white p-2"
        >
          {CUSTOM_SECTION_OPTIONS.map((option, index) => (
            <button
              key={option.type}
              ref={index === 0 ? firstOptionRef : undefined}
              type="button"
              disabled={add.isPending}
              onClick={() => choose(option.type)}
              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-butter-soft focus-visible:bg-butter-soft disabled:opacity-50"
            >
              <span className="block font-bold">{SECTION_META[option.type].label}</span>
              <span className="block text-sm text-ink/70">{option.description}</span>
            </button>
          ))}
          <p className="px-3 pb-1 text-xs text-ink/60">New sections go just above the booking form. Drag to move them.</p>
        </div>
      )}
      {add.isPending && (
        <p role="status" className="text-sm font-semibold">
          Adding…
        </p>
      )}
      {add.isError && (
        <p role="alert" className="text-sm font-semibold text-cherry-deep">
          {saveErrorMessage(add.error)}
        </p>
      )}
    </div>
  )
}
