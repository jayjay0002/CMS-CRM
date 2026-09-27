import { Link } from 'react-router'

import { formatEventDate } from '@/entities/booking'
import {
  describeProposalActivity,
  formatUsd,
  formatValidUntil,
  type ProposalListItem,
  ProposalStatusBadge,
} from '@/entities/proposal'
import { adminProposalPath } from '@/shared/config'

type Props = {
  proposals: readonly ProposalListItem[]
}

const HEADER_CELL = 'px-4 py-3 text-left text-sm font-bold whitespace-nowrap'
const CELL = 'px-4 py-3 align-top'

// Desktop: a table. Phones: stacked cards. Every row opens the proposal editor.
export function ProposalList({ proposals }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border-2 border-ink bg-white md:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">Proposals</caption>
          <thead className="border-b-2 border-ink bg-butter-soft">
            <tr>
              <th scope="col" className={HEADER_CELL}>Booking</th>
              <th scope="col" className={HEADER_CELL}>Customer</th>
              <th scope="col" className={HEADER_CELL}>Event</th>
              <th scope="col" className={HEADER_CELL}>Status</th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>Total</th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>Deposit</th>
              <th scope="col" className={HEADER_CELL}>Valid until</th>
              <th scope="col" className={HEADER_CELL}>Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/15">
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-butter-soft/50">
                <td className={CELL}>
                  <Link
                    to={adminProposalPath(proposal.id)}
                    className="font-mono font-bold underline decoration-cherry decoration-2 underline-offset-4"
                  >
                    {proposal.booking_reference}
                    <span className="sr-only">: open proposal for {proposal.customer_name}</span>
                  </Link>
                </td>
                <td className={`${CELL} font-semibold`}>{proposal.customer_name}</td>
                <td className={`${CELL} whitespace-nowrap`}>{formatEventDate(proposal.event_date)}</td>
                <td className={CELL}>
                  <ProposalStatusBadge proposal={proposal} />
                </td>
                <td className={`${CELL} text-right font-semibold tabular-nums`}>{formatUsd(proposal.total)}</td>
                <td className={`${CELL} text-right tabular-nums`}>{formatUsd(proposal.deposit)}</td>
                <td className={`${CELL} whitespace-nowrap`}>{formatValidUntil(proposal.valid_until)}</td>
                <td className={`${CELL} text-sm text-ink/75`}>{describeProposalActivity(proposal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="Proposals">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <Link
              to={adminProposalPath(proposal.id)}
              className="block rounded-2xl border-2 border-ink bg-white p-4 shadow-sign hover:bg-butter-soft/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{proposal.customer_name}</p>
                  <p className="font-mono text-sm text-ink/70">{proposal.booking_reference}</p>
                </div>
                <ProposalStatusBadge proposal={proposal} />
              </div>
              <p className="mt-3 font-semibold tabular-nums">
                {formatUsd(proposal.total)}
                <span className="font-normal text-ink/70"> ({formatUsd(proposal.deposit)} deposit)</span>
              </p>
              <p className="text-sm text-ink/75">
                Event {formatEventDate(proposal.event_date)}, valid until {formatValidUntil(proposal.valid_until)}
              </p>
              <p className="mt-1 text-sm text-ink/75">{describeProposalActivity(proposal)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
