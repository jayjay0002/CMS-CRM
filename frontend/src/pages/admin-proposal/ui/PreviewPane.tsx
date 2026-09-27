import { useState } from 'react'

import type { BookingDetail } from '@/entities/booking'
import type { AdminProposal } from '@/entities/proposal'
import { ThemeScope, useSite } from '@/entities/site'
import { draftAsCustomerSees, ProposalDocument } from '@/widgets/proposal-document'

const DEVICES = {
  desktop: { label: 'Desktop', frameClass: 'max-w-4xl' },
  mobile: { label: 'Mobile', frameClass: 'max-w-[390px]' },
} as const

type Device = keyof typeof DEVICES
const DEVICE_ORDER: readonly Device[] = ['desktop', 'mobile']

const TOGGLE = 'rounded-full px-3 py-1 text-sm font-bold'

type Props = {
  proposal: AdminProposal
  booking: BookingDetail | undefined
  label: string
}

// The quote exactly as the customer sees it, in the site's own theme.
export function PreviewPane({ proposal, booking, label }: Props) {
  const [device, setDevice] = useState<Device>('desktop')
  const site = useSite().data

  return (
    <section aria-label="Customer preview" className="flex min-h-0 flex-1 flex-col bg-ink/5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b-2 border-ink/10 px-4 py-2">
        <p className="text-sm font-semibold text-ink/70">{label}</p>
        <div role="group" aria-label="Preview width" className="flex rounded-full border-2 border-ink bg-white p-0.5">
          {DEVICE_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={device === option}
              onClick={() => setDevice(option)}
              className={device === option ? `${TOGGLE} bg-ink text-kernel` : `${TOGGLE} hover:bg-butter-soft`}
            >
              {DEVICES[option].label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {booking && site ? (
          <ThemeScope
            theme={site.theme}
            className={`mx-auto rounded-2xl p-3 shadow-sign md:p-5 ${DEVICES[device].frameClass}`}
          >
            <ProposalDocument proposal={draftAsCustomerSees(proposal, booking, site.settings)} />
          </ThemeScope>
        ) : (
          <p role="status" className="p-4 text-ink/70">
            Loading preview…
          </p>
        )}
      </div>
    </section>
  )
}
