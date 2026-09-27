import { type MouseEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import type { BookingDetail } from '@/entities/booking'
import { type AdminProposal } from '@/entities/proposal'
import { useDuplicateProposal } from '@/features/create-proposal'
import { DeleteDraftDialog } from '@/features/delete-proposal'
import {
  LineItemsEditor,
  proposalWithEdits,
  SaveStateIndicator,
  TermsEditor,
  useProposalEditor,
} from '@/features/edit-proposal'
import { SendProposalButton } from '@/features/send-proposal'
import { adminBookingPath, adminProposalPath } from '@/shared/config'
import { ConfirmDialog, MenuButton } from '@/shared/ui'

import { ActionBar } from './ActionBar'
import { TotalsFooter } from './TotalsFooter'
import { BookingContextCard } from './BookingContextCard'
import { PreviewPane } from './PreviewPane'
import { Workspace } from './Workspace'

// Warns before the tab is closed or reloaded while edits haven't been saved yet.
function useUnloadWarning(hasUnsaved: boolean): void {
  useEffect(() => {
    if (!hasUnsaved) return undefined
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsaved])
}

type Props = {
  proposal: AdminProposal
  booking: BookingDetail | undefined
  onSent: (sent: AdminProposal, sentTo: string) => void
}

export function DraftWorkspace({ proposal, booking, onSent }: Props) {
  const navigate = useNavigate()
  const editor = useProposalEditor(proposal)
  const duplicate = useDuplicateProposal()
  const [isDeleting, setIsDeleting] = useState(false)
  const [blockedLeaveTarget, setBlockedLeaveTarget] = useState<string | null>(null)
  const bookingPath = adminBookingPath(proposal.booking_id)
  const customerEmail = booking?.customer_email ?? 'the customer'
  useUnloadWarning(editor.isDirty)

  // Save first; if that fails, ask before leaving so edits aren't lost silently.
  async function leaveTo(target: string) {
    if (await editor.flush()) navigate(target)
    else setBlockedLeaveTarget(target)
  }

  function onBack(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    void leaveTo(bookingPath)
  }

  async function duplicateDraft() {
    if (!(await editor.flush())) return
    duplicate.mutate(proposal.id, { onSuccess: (copy) => navigate(adminProposalPath(copy.id)) })
  }

  const preview = proposalWithEdits(proposal, editor.values, editor.totals)

  return (
    <>
      <Workspace
        editLabel="Edit"
        bar={
          <ActionBar
            proposal={proposal}
            bookingPath={bookingPath}
            bookingReference={booking?.reference ?? null}
            onBack={onBack}
            status={<SaveStateIndicator state={editor.saveState} onRetry={() => void editor.flush()} />}
            actions={
              <>
                <SendProposalButton
                  proposal={proposal}
                  customerEmail={customerEmail}
                  totalCents={editor.totals.total}
                  depositCents={editor.totals.deposit}
                  validUntil={editor.values.validUntil}
                  blockers={editor.sendBlockers}
                  beforeSend={editor.flush}
                  onSent={(sent) => onSent(sent, customerEmail)}
                />
                <MenuButton
                  label="More actions"
                  items={[
                    { label: duplicate.isPending ? 'Copying…' : 'Duplicate as new draft', onSelect: duplicateDraft },
                    { label: 'Delete draft', tone: 'danger', onSelect: () => setIsDeleting(true) },
                  ]}
                />
              </>
            }
          />
        }
        panel={
          <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-6">
            <BookingContextCard booking={booking} />
            <LineItemsEditor editor={editor} />
            <TermsEditor editor={editor} />
          </form>
        }
        panelFooter={<TotalsFooter totals={editor.totals} />}
        preview={<PreviewPane proposal={preview} booking={booking} label="Customer view — updates as you type" />}
      />
      <DeleteDraftDialog
        proposal={proposal}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onDeleted={() => navigate(bookingPath)}
      />
      <ConfirmDialog
        isOpen={blockedLeaveTarget !== null}
        title="Leave without your latest changes?"
        tone="danger"
        confirmLabel="Leave anyway"
        busyLabel="Leaving…"
        cancelLabel="Keep editing"
        onConfirm={() => blockedLeaveTarget && navigate(blockedLeaveTarget)}
        onClose={() => setBlockedLeaveTarget(null)}
      >
        <p>Some changes couldn’t be saved. Fix the highlighted fields or try again before leaving.</p>
      </ConfirmDialog>
    </>
  )
}
