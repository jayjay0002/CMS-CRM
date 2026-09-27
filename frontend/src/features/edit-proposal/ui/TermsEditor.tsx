import { useId } from 'react'

import { centsToDecimal, PROPOSAL_LIMITS } from '@/entities/proposal'
import { addDaysToIsoDate, todayInBusinessTimezone } from '@/shared/lib'
import { Field, fieldAria, INPUT_CLASSES } from '@/shared/ui'

import { DEPOSIT_PRESETS, depositForPercent, VALID_FOR_PRESETS } from '../config/editor'
import { DEPOSIT_TOO_HIGH } from '../model/schema'
import type { ProposalEditor } from '../model/useProposalEditor'

const MESSAGE_ROWS = 4
const PRESET = 'rounded-full border-2 px-2.5 py-0.5 text-xs font-bold'
const PRESET_ON = `${PRESET} border-ink bg-ink text-kernel`
const PRESET_OFF = `${PRESET} border-ink/40 bg-white hover:border-ink hover:bg-butter-soft`
const SET_OPTIONS = { shouldDirty: true, shouldValidate: true } as const

type Props = {
  editor: ProposalEditor
}

export function TermsEditor({ editor }: Props) {
  const baseId = useId()
  const { form, values, totals } = editor
  const {
    register,
    setValue,
    formState: { errors },
  } = form
  const today = todayInBusinessTimezone()
  const depositError = errors.deposit?.message ?? (totals.deposit > totals.total ? DEPOSIT_TOO_HIGH : undefined)
  const fieldId = (name: string) => `${baseId}-${name}`

  return (
    <section aria-labelledby={fieldId('heading')} className="space-y-4">
      <h2 id={fieldId('heading')} className="font-display text-xl">
        Terms
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Discount ($)" htmlFor={fieldId('discount')} error={errors.discount?.message}>
          <input
            id={fieldId('discount')}
            inputMode="decimal"
            className={INPUT_CLASSES}
            {...fieldAria(fieldId('discount'), errors.discount?.message)}
            {...register('discount')}
          />
        </Field>
        <Field label="Deposit ($)" htmlFor={fieldId('deposit')} error={depositError}>
          <input
            id={fieldId('deposit')}
            inputMode="decimal"
            className={INPUT_CLASSES}
            {...fieldAria(fieldId('deposit'), depositError)}
            {...register('deposit')}
          />
          <div role="group" aria-label="Deposit shortcuts" className="mt-2 flex flex-wrap gap-1.5">
            {DEPOSIT_PRESETS.map((preset) => {
              const amount = centsToDecimal(depositForPercent(totals.total, preset.percent))
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={totals.deposit === depositForPercent(totals.total, preset.percent)}
                  onClick={() => setValue('deposit', amount, SET_OPTIONS)}
                  className={totals.deposit === depositForPercent(totals.total, preset.percent) ? PRESET_ON : PRESET_OFF}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </Field>
      </div>

      <Field label="Valid until" htmlFor={fieldId('valid-until')} error={errors.validUntil?.message}>
        <input
          id={fieldId('valid-until')}
          type="date"
          min={today}
          className={INPUT_CLASSES}
          {...fieldAria(fieldId('valid-until'), errors.validUntil?.message)}
          {...register('validUntil')}
        />
        <div role="group" aria-label="Valid for" className="mt-2 flex flex-wrap gap-1.5">
          {VALID_FOR_PRESETS.map((days) => {
            const date = addDaysToIsoDate(today, days)
            return (
              <button
                key={days}
                type="button"
                aria-pressed={values.validUntil === date}
                onClick={() => setValue('validUntil', date, SET_OPTIONS)}
                className={values.validUntil === date ? PRESET_ON : PRESET_OFF}
              >
                {days} days
              </button>
            )
          })}
        </div>
      </Field>

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
        <p className="mt-1 text-right text-xs text-ink/60">
          {(PROPOSAL_LIMITS.messageMaxLength - values.message.length).toLocaleString('en-US')} characters left
        </p>
      </Field>
    </section>
  )
}
