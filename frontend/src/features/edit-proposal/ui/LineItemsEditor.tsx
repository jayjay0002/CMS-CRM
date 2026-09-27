import { useId } from 'react'
import { useFieldArray } from 'react-hook-form'

import { formatCents, lineTotalCents, PROPOSAL_LIMITS } from '@/entities/proposal'
import { errorId, fieldAria } from '@/shared/ui'

import { QUICK_ADD_ITEMS } from '../config/editor'
import type { ProposalEditor } from '../model/useProposalEditor'
import { NEW_ITEM } from '../model/schema'

const INLINE_LABEL = 'text-xs font-semibold text-ink/60'
const COMPACT_INPUT =
  'rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 text-sm text-ink aria-[invalid=true]:border-cherry'
const ICON_BUTTON =
  'grid size-7 place-items-center rounded-full border-2 border-ink/60 text-xs font-bold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/25 disabled:hover:bg-transparent'
const CHIP =
  'rounded-full border-2 border-dashed border-ink/60 bg-white px-3 py-1 text-sm font-semibold hover:border-ink hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  editor: ProposalEditor
}

export function LineItemsEditor({ editor }: Props) {
  const baseId = useId()
  const { form, values } = editor
  const {
    register,
    control,
    formState: { errors },
  } = form
  const items = useFieldArray({ control, name: 'items' })
  const isFull = items.fields.length >= PROPOSAL_LIMITS.maxItems
  const id = (index: number, part: string) => `${baseId}-item-${index}-${part}`

  // New lines land with their price focused, ready to adjust.
  function addLine(description: string, unitPrice: string) {
    items.append(
      { ...NEW_ITEM, description, unitPrice },
      { shouldFocus: true, focusName: `items.${items.fields.length}.${description ? 'unitPrice' : 'description'}` },
    )
  }

  return (
    <section aria-labelledby={`${baseId}-heading`} className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={`${baseId}-heading`} className="font-display text-xl">
          Line items
        </h2>
        <span className="text-xs text-ink/60">
          {items.fields.length} / {PROPOSAL_LIMITS.maxItems}
        </span>
      </div>

      <ol className="space-y-2">
        {items.fields.map((field, index) => {
          const itemErrors = errors.items?.[index]
          const item = values.items[index]
          const amount = lineTotalCents({ quantity: Number(item?.quantity), unit_price: item?.unitPrice ?? '0' })
          const messages = [itemErrors?.description, itemErrors?.quantity, itemErrors?.unitPrice]
            .map((error) => error?.message)
            .filter(Boolean)
          const rowError = messages.join(' ') || undefined
          return (
            <li key={field.id} className="rounded-xl border-2 border-ink/15 bg-white p-2">
              {/* Line 1: what it is. Line 2: how many × price = amount, plus row actions. */}
              <label htmlFor={id(index, 'description')} className="sr-only">
                Item {index + 1} description
              </label>
              <input
                id={id(index, 'description')}
                maxLength={PROPOSAL_LIMITS.descriptionMaxLength}
                placeholder="What's included"
                className={`${COMPACT_INPUT} w-full`}
                  {...fieldAria(id(index, 'row'), itemErrors?.description?.message)}
                  {...register(`items.${index}.description`)}
                />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label htmlFor={id(index, 'quantity')} className={INLINE_LABEL}>
                  Qty<span className="sr-only"> for item {index + 1}</span>
                </label>
                <input
                  id={id(index, 'quantity')}
                  type="number"
                  inputMode="numeric"
                  min={PROPOSAL_LIMITS.minQuantity}
                  max={PROPOSAL_LIMITS.maxQuantity}
                  className={`${COMPACT_INPUT} w-16`}
                  {...fieldAria(id(index, 'row'), itemErrors?.quantity?.message)}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
                <label htmlFor={id(index, 'price')} className={INLINE_LABEL}>
                  × $<span className="sr-only"> unit price for item {index + 1}</span>
                </label>
                <input
                  id={id(index, 'price')}
                  inputMode="decimal"
                  className={`${COMPACT_INPUT} w-24`}
                  {...fieldAria(id(index, 'row'), itemErrors?.unitPrice?.message)}
                  {...register(`items.${index}.unitPrice`)}
                />
                <span className="ml-auto text-sm font-bold tabular-nums">
                  <span className="sr-only">Amount </span>
                  {formatCents(amount)}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Move item ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => items.move(index, index - 1)}
                    className={ICON_BUTTON}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move item ${index + 1} down`}
                    disabled={index === items.fields.length - 1}
                    onClick={() => items.move(index, index + 1)}
                    className={ICON_BUTTON}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={items.fields.length === 1}
                    onClick={() => items.remove(index)}
                    className={ICON_BUTTON}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {rowError && (
                <p id={errorId(id(index, 'row'))} className="mt-1 px-1 text-xs font-semibold text-cherry-deep">
                  {rowError}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {errors.items?.root?.message && (
        <p className="text-sm font-semibold text-cherry-deep">{errors.items.root.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={isFull} onClick={() => addLine('', NEW_ITEM.unitPrice)} className={CHIP}>
          + Add item
        </button>
        <span className="text-xs font-semibold text-ink/60">Quick add:</span>
        {QUICK_ADD_ITEMS.map((quick) => (
          <button
            key={quick.label}
            type="button"
            disabled={isFull}
            onClick={() => addLine(quick.description, quick.unitPrice)}
            className={CHIP}
          >
            + {quick.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink/60">Quick-add prices are starting suggestions. Edit them to fit the event.</p>
    </section>
  )
}
