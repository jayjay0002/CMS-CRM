import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import {
  type AdminProposal,
  computeTotals,
  formatCents,
  lineTotalCents,
  PROPOSAL_LIMITS,
  ProposalTotalsTable,
} from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { todayInBusinessTimezone } from '@/shared/lib'
import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import {
  DEPOSIT_TOO_HIGH,
  NEW_ITEM,
  type ProposalFormValues,
  proposalFormSchema,
  toDraftInput,
  toFormValues,
} from '../model/schema'
import { useUpdateProposal } from '../model/useUpdateProposal'

const SMALL_BUTTON =
  'grid size-9 place-items-center rounded-full border-2 border-ink text-sm font-bold hover:bg-butter disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/30 disabled:hover:bg-transparent'
const ADD_BUTTON =
  'rounded-full border-2 border-dashed border-ink px-4 py-2 font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-50'
const MESSAGE_ROWS = 4
const MONEY_STEP = '0.01'

type Props = {
  proposal: AdminProposal
  onDirtyChange: (isDirty: boolean) => void
}

export function ProposalForm({ proposal, onDirtyChange }: Props) {
  const formId = useId()
  const update = useUpdateProposal(proposal.id)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: toFormValues(proposal),
  })
  const items = useFieldArray({ control, name: 'items' })
  const watched = useWatch({ control })

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

  const totals = computeTotals(
    (watched.items ?? []).map((item) => ({ quantity: Number(item?.quantity), unit_price: item?.unitPrice ?? '0' })),
    watched.discount ?? '0',
    watched.deposit ?? '0',
  )
  const depositTooHigh = totals.deposit > totals.total
  const depositError = errors.deposit?.message ?? (depositTooHigh ? DEPOSIT_TOO_HIGH : undefined)

  const onSubmit = handleSubmit((values) => {
    update.mutate(toDraftInput(values), { onSuccess: (saved) => reset(toFormValues(saved)) })
  })

  const fieldId = (name: string) => `${formId}-${name}`

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="font-display text-2xl">Line items</legend>
          <p className="text-sm text-ink/70">
            {items.fields.length} of up to {PROPOSAL_LIMITS.maxItems} items.
          </p>
          <ol className="space-y-3">
            {items.fields.map((field, index) => {
              const itemErrors = errors.items?.[index]
              const item = watched.items?.[index]
              const rowTotal = lineTotalCents({ quantity: Number(item?.quantity), unit_price: item?.unitPrice ?? '0' })
              return (
                <li key={field.id} className="rounded-2xl border-2 border-ink/25 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink/70">Item {index + 1}</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        aria-label={`Move item ${index + 1} up`}
                        disabled={index === 0}
                        onClick={() => items.move(index, index - 1)}
                        className={SMALL_BUTTON}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Move item ${index + 1} down`}
                        disabled={index === items.fields.length - 1}
                        onClick={() => items.move(index, index + 1)}
                        className={SMALL_BUTTON}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove item ${index + 1}`}
                        disabled={items.fields.length === 1}
                        onClick={() => items.remove(index)}
                        className={SMALL_BUTTON}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem]">
                    <Field
                      label="Description"
                      htmlFor={fieldId(`item-${index}-description`)}
                      error={itemErrors?.description?.message}
                    >
                      <input
                        id={fieldId(`item-${index}-description`)}
                        maxLength={PROPOSAL_LIMITS.descriptionMaxLength}
                        className={INPUT_CLASSES}
                        {...fieldAria(fieldId(`item-${index}-description`), itemErrors?.description?.message)}
                        {...register(`items.${index}.description`)}
                      />
                    </Field>
                    <Field label="Qty" htmlFor={fieldId(`item-${index}-quantity`)} error={itemErrors?.quantity?.message}>
                      <input
                        id={fieldId(`item-${index}-quantity`)}
                        type="number"
                        inputMode="numeric"
                        min={PROPOSAL_LIMITS.minQuantity}
                        max={PROPOSAL_LIMITS.maxQuantity}
                        className={INPUT_CLASSES}
                        {...fieldAria(fieldId(`item-${index}-quantity`), itemErrors?.quantity?.message)}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </Field>
                    <Field
                      label="Unit price ($)"
                      htmlFor={fieldId(`item-${index}-price`)}
                      error={itemErrors?.unitPrice?.message}
                    >
                      <input
                        id={fieldId(`item-${index}-price`)}
                        inputMode="decimal"
                        className={INPUT_CLASSES}
                        {...fieldAria(fieldId(`item-${index}-price`), itemErrors?.unitPrice?.message)}
                        {...register(`items.${index}.unitPrice`)}
                      />
                    </Field>
                  </div>
                  <p className="mt-2 text-right text-sm">
                    Line total <span className="font-bold tabular-nums">{formatCents(rowTotal)}</span>
                  </p>
                </li>
              )
            })}
          </ol>
          {errors.items?.root?.message && (
            <p className="text-sm font-semibold text-cherry-deep">{errors.items.root.message}</p>
          )}
          <button
            type="button"
            onClick={() => items.append({ ...NEW_ITEM })}
            disabled={items.fields.length >= PROPOSAL_LIMITS.maxItems}
            className={ADD_BUTTON}
          >
            + Add item
          </button>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Discount ($)" htmlFor={fieldId('discount')} error={errors.discount?.message}>
            <input
              id={fieldId('discount')}
              inputMode="decimal"
              step={MONEY_STEP}
              className={INPUT_CLASSES}
              {...fieldAria(fieldId('discount'), errors.discount?.message)}
              {...register('discount')}
            />
          </Field>
          <Field
            label="Deposit ($)"
            htmlFor={fieldId('deposit')}
            error={depositError}
          >
            <input
              id={fieldId('deposit')}
              inputMode="decimal"
              step={MONEY_STEP}
              className={INPUT_CLASSES}
              {...fieldAria(fieldId('deposit'), depositError)}
              {...register('deposit')}
            />
          </Field>
          <Field label="Valid until" htmlFor={fieldId('valid-until')} error={errors.validUntil?.message}>
            <input
              id={fieldId('valid-until')}
              type="date"
              min={todayInBusinessTimezone()}
              className={INPUT_CLASSES}
              {...fieldAria(fieldId('valid-until'), errors.validUntil?.message)}
              {...register('validUntil')}
            />
          </Field>
        </div>

        <Field label="Message to the customer (optional)" htmlFor={fieldId('message')} error={errors.message?.message}>
          <textarea
            id={fieldId('message')}
            rows={MESSAGE_ROWS}
            maxLength={PROPOSAL_LIMITS.messageMaxLength}
            placeholder="Thanks for thinking of us! Here’s what we’d bring to your party…"
            className={INPUT_CLASSES}
            {...fieldAria(fieldId('message'), errors.message?.message)}
            {...register('message')}
          />
        </Field>
      </div>

      <aside aria-label="Totals" className="h-fit space-y-4 rounded-3xl border-4 border-ink bg-butter-soft p-5 lg:sticky lg:top-6">
        <h2 className="font-display text-2xl">Totals</h2>
        <ProposalTotalsTable totals={totals} />
        <button
          type="submit"
          disabled={update.isPending || depositTooHigh}
          className={buttonClasses('primary', 'w-full py-3')}
        >
          {update.isPending ? 'Saving…' : 'Save draft'}
        </button>
        <p role="status" className="text-sm text-ink/70">
          {isDirty ? 'Unsaved changes' : 'All changes saved'}
        </p>
        {update.isError && <FormMessage tone="error">{saveErrorMessage(update.error)}</FormMessage>}
        {update.isSuccess && !isDirty && <FormMessage tone="success">Draft saved.</FormMessage>}
      </aside>
    </form>
  )
}
