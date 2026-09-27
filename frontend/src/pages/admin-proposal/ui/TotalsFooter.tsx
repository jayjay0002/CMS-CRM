import { useId, useState } from 'react'

import { formatCents, type ProposalTotalsInCents, ProposalTotalsTable } from '@/entities/proposal'
import { MEDIA_QUERIES, useMediaQuery } from '@/shared/lib'

type Props = {
  totals: ProposalTotalsInCents
}

// On phones the full totals would take a quarter of the Edit tab, so they collapse to one line.
export function TotalsFooter({ totals }: Props) {
  const isDesktop = useMediaQuery(MEDIA_QUERIES.desktop)
  const [isExpanded, setIsExpanded] = useState(false)
  const detailsId = useId()

  if (isDesktop) return <ProposalTotalsTable totals={totals} />

  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
      >
        <span className="font-semibold">
          Total <span className="font-bold">{formatCents(totals.total)}</span>
          <span className="text-ink/70"> · Deposit {formatCents(totals.deposit)}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-ink/80">
          {isExpanded ? 'Hide' : 'Details'}
          <span aria-hidden="true" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </span>
      </button>
      <div id={detailsId} hidden={!isExpanded} className="pt-3">
        <ProposalTotalsTable totals={totals} />
      </div>
    </div>
  )
}
