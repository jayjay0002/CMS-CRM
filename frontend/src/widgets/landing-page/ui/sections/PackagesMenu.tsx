import type { ReactNode } from 'react'

import { type Package, usePackages } from '@/entities/package'
import type { PackagesMenuContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { formatPrice } from '@/shared/lib'
import { Kernel } from '@/shared/ui'

import { usePauseOffscreen } from '../../lib/usePauseOffscreen'

// Marquee bulbs along the top and bottom edge of the menu board. Every other bulb blinks
// half a cycle late (the delay is half of --animate-bulb-chase) so the lights chase.
const BULB_COUNT = 14

// The featured row is lit up like a sign: a butter frame pulled out into the board's padding,
// so its text still lines up with the other rows.
const FEATURED_ROW_CLASSES =
  '-mx-3 rounded-2xl bg-kernel/[0.06] px-3 ring-2 ring-butter my-3 md:-mx-6 md:px-6 border-transparent!'

function BulbRow({ position }: { position: 'top' | 'bottom' }) {
  const edge = position === 'top' ? 'top-3' : 'bottom-3'
  return (
    <div aria-hidden="true" className={`absolute inset-x-8 flex justify-between ${edge}`}>
      {Array.from({ length: BULB_COUNT }, (_, index) => (
        <span
          key={index}
          className="size-2.5 animate-bulb-chase rounded-full bg-butter shadow-[0_0_10px_3px_var(--color-butter)] even:[animation-delay:-700ms]"
        />
      ))}
    </div>
  )
}

function BoardMessage({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-lg text-kernel/85">{children}</p>
}

function FeaturedBadge() {
  return (
    <p className="mb-3 inline-flex -rotate-2 items-center gap-1.5 rounded-full border-2 border-ink bg-cherry px-3 py-1 text-sm font-bold tracking-wide text-kernel uppercase shadow-[3px_3px_0_var(--color-butter)]">
      <Kernel className="size-4" />
      Most popular
    </p>
  )
}

type MenuItemProps = {
  pkg: Package
  isFeatured: boolean
  onBook: (packageSlug: string) => void
}

// Name ..... price, then what you get, then the button: read top to bottom, like a menu board.
function MenuItem({ pkg, isFeatured, onBook }: MenuItemProps) {
  return (
    <li className={`reveal py-8 first:mt-2 last:mb-2 ${isFeatured ? FEATURED_ROW_CLASSES : ''}`}>
      {isFeatured && <FeaturedBadge />}
      <div className="flex items-baseline gap-3 md:gap-4">
        <h3 className="font-display text-[clamp(1.6rem,1.1rem+2vw,2.25rem)] leading-tight text-butter">{pkg.name}</h3>
        <span aria-hidden="true" className="min-w-6 flex-1 border-b-4 border-dotted border-kernel/30" />
        <p className="shrink-0 font-display text-[clamp(1.6rem,1.1rem+2vw,2.25rem)] leading-tight">
          {formatPrice(pkg.price)}
        </p>
      </div>
      <div className="mt-3 grid gap-5 md:grid-cols-[1fr_auto] md:items-end md:gap-8">
        <div>
          <p className="max-w-xl leading-relaxed text-kernel/85">{pkg.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-butter-soft">
            <li className="rounded-full border-2 border-kernel/25 px-3 py-1">{pkg.servings} servings</li>
            <li className="rounded-full border-2 border-kernel/25 px-3 py-1">{pkg.durationHours} hours of popping</li>
          </ul>
        </div>
        <BookButton variant="onDark" className="w-full min-h-12 md:w-auto" onBook={() => onBook(pkg.slug)}>
          Book {pkg.name}
        </BookButton>
      </div>
    </li>
  )
}

type Props = {
  content: PackagesMenuContent
  contactPhone: string
  onBook: (packageSlug: string) => void
}

export function PackagesMenu({ content, contactPhone, onBook }: Props) {
  const { data: packages, isPending, isError } = usePackages()
  const boardRef = usePauseOffscreen<HTMLDivElement>()

  function renderBoard() {
    if (isPending) return <BoardMessage>Loading the menu…</BoardMessage>
    if (isError) {
      return (
        <BoardMessage>
          The menu didn't load. Refresh the page, or call us at {contactPhone}.
        </BoardMessage>
      )
    }
    if (packages.length === 0) {
      return <BoardMessage>We're updating the menu. Call us at {contactPhone} to book.</BoardMessage>
    }
    return (
      <ul className="divide-y-2 divide-dashed divide-kernel/20">
        {packages.map((pkg) => (
          <MenuItem
            key={pkg.slug}
            pkg={pkg}
            isFeatured={pkg.slug === content.featuredPackageSlug}
            onBook={onBook}
          />
        ))}
      </ul>
    )
  }

  return (
    <section id={SECTION_IDS.packages} className="section-anchor bg-cherry py-[clamp(3.5rem,8vw,7rem)]">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <h2 className="font-display text-[clamp(2.75rem,2rem+3vw,3.75rem)] leading-tight text-kernel [text-shadow:4px_4px_0_var(--color-ink)]">
          {content.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-kernel md:text-xl">{content.description}</p>

        <div
          ref={boardRef}
          className="relative mt-10 rounded-[2rem] border-4 border-ink bg-ink px-5 py-12 text-kernel shadow-[6px_6px_0_var(--color-cherry-deep)] md:mt-12 md:px-12 md:shadow-[10px_10px_0_var(--color-cherry-deep)]"
        >
          <BulbRow position="top" />
          {renderBoard()}
          <BulbRow position="bottom" />
        </div>
      </div>
    </section>
  )
}
