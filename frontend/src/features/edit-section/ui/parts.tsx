import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { Field, fieldAria, INPUT_CLASSES } from '@/shared/ui'

type TextFieldProps = {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  // Rows for a multi-line box; omit for a single-line input.
  rows?: number
  hint?: string
}

export function TextField({ id, label, registration, error, rows, hint }: TextFieldProps) {
  const hintId = `${id}-hint`
  const aria = fieldAria(id, error)
  const describedBy = [aria['aria-describedby'], hint ? hintId : undefined].filter(Boolean).join(' ') || undefined
  const props = { id, className: INPUT_CLASSES, ...aria, 'aria-describedby': describedBy, ...registration }

  return (
    <Field label={label} htmlFor={id} error={error}>
      {hint && (
        <p id={hintId} className="-mt-1 mb-1.5 text-sm text-ink/65">
          {hint}
        </p>
      )}
      {rows ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
    </Field>
  )
}

const SMALL_BUTTON =
  'grid size-8 place-items-center rounded-full border-2 border-ink text-sm font-bold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/30 disabled:hover:bg-transparent'

type ListEditorProps = {
  legend: string
  // Singular name for one row, e.g. "question".
  itemNoun: string
  itemKeys: readonly string[]
  minItems: number
  maxItems: number
  onAdd: () => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  renderItem: (index: number) => ReactNode
  error?: string
}

export function ListEditor({
  legend,
  itemNoun,
  itemKeys,
  minItems,
  maxItems,
  onAdd,
  onMove,
  onRemove,
  renderItem,
  error,
}: ListEditorProps) {
  const count = itemKeys.length
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-semibold">
        {legend} <span className="font-normal text-ink/65">({count} of up to {maxItems})</span>
      </legend>
      <ol className="space-y-3">
        {itemKeys.map((key, index) => {
          const position = index + 1
          return (
            <li key={key} className="rounded-2xl border-2 border-ink/20 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink/70">
                  {itemNoun[0]?.toUpperCase()}
                  {itemNoun.slice(1)} {position}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onMove(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${itemNoun} ${position} up`}
                    className={SMALL_BUTTON}
                  >
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, index + 1)}
                    disabled={index === count - 1}
                    aria-label={`Move ${itemNoun} ${position} down`}
                    className={SMALL_BUTTON}
                  >
                    <span aria-hidden="true">↓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={count <= minItems}
                    aria-label={`Remove ${itemNoun} ${position}`}
                    className={SMALL_BUTTON}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">{renderItem(index)}</div>
            </li>
          )
        })}
      </ol>
      {error && <p className="text-sm font-semibold text-cherry-deep">{error}</p>}
      <button
        type="button"
        onClick={onAdd}
        disabled={count >= maxItems}
        className="rounded-full border-2 border-dashed border-ink px-4 py-2 text-sm font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/35 disabled:hover:bg-transparent"
      >
        + Add {itemNoun}
      </button>
    </fieldset>
  )
}
