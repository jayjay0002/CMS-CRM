import type { ReactNode } from 'react'
import { useParams } from 'react-router'

import { isProposalNotFound, usePublicProposal } from '@/entities/proposal'
import { useApplySiteTheme, useSite } from '@/entities/site'
import { Kernel } from '@/shared/ui'
import { ProposalDocument } from '@/widgets/proposal-document'

import { useNoIndex } from '../lib/useNoIndex'

const PAGE_TITLE = 'Your proposal'
const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign-lg md:p-10'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'

function Frame({ businessName, children }: { businessName: string | null; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-kernel text-ink">
      <header className="border-b-2 border-ink bg-butter print:bg-transparent">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-5 py-4 md:px-8">
          <Kernel className="size-9 shrink-0" />
          {businessName && <span className="font-display text-xl sm:text-2xl">{businessName}</span>}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">{children}</main>
    </div>
  )
}

export function PublicProposalPage() {
  const { token = '' } = useParams()
  const site = useSite()
  const proposal = usePublicProposal(token)
  useApplySiteTheme(site.data?.theme ?? null)
  useNoIndex(PAGE_TITLE)

  const businessName = proposal.data?.business.name ?? site.data?.settings.businessName ?? null

  function renderBody() {
    // Unknown links and drafts (not public until sent) both come back as 404.
    if (isProposalNotFound(proposal.error)) {
      return (
        <div className={CARD}>
          <h1 className="font-display text-3xl">We couldn’t find that proposal</h1>
          <p className="mt-2">
            The link may be incomplete, or the proposal isn’t ready yet. Check the email we sent you, or contact us.
          </p>
        </div>
      )
    }
    if (proposal.isPending) {
      return (
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading your proposal…</span>
          <div className="h-12 w-64 animate-pulse rounded-full bg-ink/10" />
          <div className="h-96 animate-pulse rounded-3xl bg-ink/10" />
        </div>
      )
    }
    if (proposal.isError) {
      return (
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-white p-6">
          <p className="font-semibold">Your proposal didn’t load. Check your connection and try again.</p>
          <button type="button" onClick={() => proposal.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    return <ProposalDocument proposal={proposal.data} respondWithToken={token} />
  }

  return <Frame businessName={businessName}>{renderBody()}</Frame>
}
