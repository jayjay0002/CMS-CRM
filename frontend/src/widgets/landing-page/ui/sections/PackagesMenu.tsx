import type { ReactNode } from 'react'

import { type Package, usePackages } from '@/entities/package'
import type { PackagesMenuContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { formatPrice } from '@/shared/lib'

// Marquee bulbs along the top and bottom edge of the menu board. Every other bulb blinks
// half a cycle late (the delay is half of --animate-bulb-chase) so the lights chase.
const BULB_COUNT = 14

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

type MenuItemsProps = {
  packages: readonly Package[]
  onBook: (packageSlug: string) => void
}

function MenuItems({ packages, onBook }: MenuItemsProps) {
  return (
    <ul className="divide-y-2 divide-dashed divide-kernel/20">
      {packages.map((pkg) => (
        <li key={pkg.slug} className="reveal py-8 first:pt-4 last:pb-4">
          <div className="flex items-baseline gap-4">
            <h3 className="font-display text-2xl text-butter md:text-4xl">{pkg.name}</h3>
            <span aria-hidden="true" className="hidden flex-1 border-b-4 border-dotted border-kernel/30 sm:block" />
            <p className="ml-auto font-display text-2xl md:text-4xl sm:ml-0">{formatPrice(pkg.price)}</p>
          </div>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="max-w-xl text-kernel/85">{pkg.description}</p>
              <p className="mt-2 font-semibold text-butter-soft">
                {pkg.servings} servings, {pkg.durationHours} hours of popping
              </p>
            </div>
            <BookButton variant="onDark" className="shrink-0" onBook={() => onBook(pkg.slug)}>
              Book this package<span className="sr-only">: {pkg.name}</span>
            </BookButton>
          </div>
        </li>
      ))}
    </ul>
  )
}

type Props = {
  content: PackagesMenuContent
  contactPhone: string
  onBook: (packageSlug: string) => void
}

export function PackagesMenu({ content, contactPhone, onBook }: Props) {
  const { data: packages, isPending, isError } = usePackages()

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
    return <MenuItems packages={packages} onBook={onBook} />
  }

  return (
    <section id={SECTION_IDS.packages} className="scroll-mt-20 bg-cherry py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <h2 className="font-display text-5xl text-kernel [text-shadow:4px_4px_0_var(--color-ink)] md:text-6xl">
          {content.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-kernel md:text-xl">{content.description}</p>

        <div className="relative mt-12 rounded-[2rem] border-4 border-ink bg-ink px-6 py-12 text-kernel shadow-[10px_10px_0_var(--color-cherry-deep)] md:px-12">
          <BulbRow position="top" />
          {renderBoard()}
          <BulbRow position="bottom" />
        </div>
      </div>
    </section>
  )
}
