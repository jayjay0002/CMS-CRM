import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { type AdminProposal, computeTotals, type ProposalTotalsInCents } from '@/entities/proposal'
import { todayInBusinessTimezone } from '@/shared/lib'

import { AUTOSAVE_DELAY_MS, SAVE_STATES, type SaveState } from '../config/editor'
import { type ProposalFormValues, proposalFormSchema, toDraftInput, toFormValues } from './schema'
import { useUpdateProposal } from './useUpdateProposal'

// Equal signatures mean "nothing new to save" ("12.5" and "12.50" count as the same).
function signatureOf(values: ProposalFormValues): string {
  return JSON.stringify(toDraftInput(values))
}

function totalsOf(values: Partial<ProposalFormValues>): ProposalTotalsInCents {
  return computeTotals(
    (values.items ?? []).map((item) => ({ quantity: Number(item?.quantity), unit_price: item?.unitPrice ?? '0' })),
    values.discount ?? '0',
    values.deposit ?? '0',
  )
}

// Why "Send to customer" is unavailable right now (empty when it can be sent).
function sendBlockers(values: ProposalFormValues, totals: ProposalTotalsInCents, isValid: boolean): string[] {
  const reasons: string[] = []
  if (values.items.length === 0) reasons.push('Add at least one item.')
  if (totals.total <= 0) reasons.push('The total must be more than $0.')
  if (totals.deposit > totals.total) reasons.push('The deposit can’t be more than the total.')
  if (values.validUntil < todayInBusinessTimezone()) reasons.push('“Valid until” must be today or later.')
  if (!isValid && reasons.length === 0) reasons.push('Fix the highlighted fields.')
  return reasons
}

// The draft editor's state: the form, live totals, and autosave (about a second after typing stops).
export function useProposalEditor(proposal: AdminProposal) {
  const initialValues = useMemo(() => toFormValues(proposal), [proposal])
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  })
  const update = useUpdateProposal(proposal.id)
  const watched = useWatch({ control: form.control }) as ProposalFormValues
  const values: ProposalFormValues = { ...initialValues, ...watched }
  const signature = signatureOf(values)

  const [savedSignature, setSavedSignature] = useState(() => signatureOf(initialValues))
  const [lastFailed, setLastFailed] = useState(false)
  const timerRef = useRef<number | null>(null)
  const inFlightRef = useRef<Promise<boolean> | null>(null)

  const parsed = proposalFormSchema.safeParse(values)
  const isValid = parsed.success
  const isDirty = signature !== savedSignature
  const totals = totalsOf(values)

  const save = useCallback(async (): Promise<boolean> => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    if (inFlightRef.current) await inFlightRef.current
    const current = form.getValues()
    const currentSignature = signatureOf(current)
    if (currentSignature === savedSignature) return true
    const check = proposalFormSchema.safeParse(current)
    if (!check.success) {
      await form.trigger()
      return false
    }
    const request = update
      .mutateAsync(toDraftInput(check.data))
      .then(() => {
        setSavedSignature(currentSignature)
        setLastFailed(false)
        return true
      })
      .catch(() => {
        setLastFailed(true)
        return false
      })
      .finally(() => {
        inFlightRef.current = null
      })
    inFlightRef.current = request
    return request
  }, [form, savedSignature, update])

  // Autosave: restart the timer on every valid change.
  useEffect(() => {
    if (!isDirty || !isValid) return undefined
    timerRef.current = window.setTimeout(() => void save(), AUTOSAVE_DELAY_MS)
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [signature, isDirty, isValid, save])

  // Leaving through the admin nav: save whatever is valid and unsaved on the way out.
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  }, [save])
  useEffect(() => () => void saveRef.current(), [])

  let saveState: SaveState = SAVE_STATES.saved
  if (update.isPending) saveState = SAVE_STATES.saving
  else if (isDirty && !isValid) saveState = SAVE_STATES.invalid
  else if (isDirty && lastFailed) saveState = SAVE_STATES.error
  else if (isDirty) saveState = SAVE_STATES.pending

  return {
    form,
    values,
    totals,
    isDirty,
    saveState,
    saveError: update.error,
    // Saves now (used before sending, duplicating or leaving). Resolves to false if it couldn't.
    flush: save,
    sendBlockers: sendBlockers(values, totals, isValid),
  }
}

export type ProposalEditor = ReturnType<typeof useProposalEditor>
