import type { PublicProposal } from '@/entities/proposal'
import { mailtoHref, telHref } from '@/shared/lib'

const LINK = 'font-semibold underline decoration-cherry decoration-2 underline-offset-4'

// "(404) 555-0147 or hello@…", both tappable.
export function ContactLinks({ business }: { business: PublicProposal['business'] }) {
  return (
    <span>
      <a href={telHref(business.phone_e164)} className={LINK}>
        {business.phone_display}
      </a>
      {business.email && (
        <>
          {' '}or{' '}
          <a href={mailtoHref(business.email)} className={LINK}>
            {business.email}
          </a>
        </>
      )}
    </span>
  )
}
