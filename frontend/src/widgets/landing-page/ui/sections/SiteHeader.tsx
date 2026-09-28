import { useEffect, useRef } from 'react'

import { BookButton } from '@/features/start-booking'
import { SECTION_IDS, type SectionId } from '@/shared/config'
import { scrollBehavior } from '@/shared/lib'
import { Kernel } from '@/shared/ui'

import { useActiveSection } from '../../lib/useActiveSection'

export type NavLink = {
  label: string
  sectionId: SectionId
}

// "You are here": a filled pill in the phone link row, a steady underline on desktop.
const ACTIVE_LINK_CLASS = 'bg-ink text-butter lg:bg-transparent lg:text-ink lg:underline'

// Slides the phone link row (when it overflows) so the current section's link stays in view.
function useKeepLinkInView(activeId: string | null) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const link = activeId ? list?.querySelector<HTMLElement>(`a[href="#${activeId}"]`) : null
    if (!list || !link || list.scrollWidth <= list.clientWidth) return
    const centered = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2
    list.scrollTo({ left: centered, behavior: scrollBehavior() })
  }, [activeId])

  return listRef
}

// One nav for every screen: inline on desktop, its own swipeable row under the logo on phones.
function SectionNav({ navLinks }: { navLinks: readonly NavLink[] }) {
  const activeId = useActiveSection(navLinks.map((link) => link.sectionId))
  const listRef = useKeepLinkInView(activeId)

  return (
    <nav aria-label="Main" className="order-last -mx-5 w-[calc(100%+2.5rem)] md:-mx-8 md:w-[calc(100%+4rem)] lg:order-none lg:mx-0 lg:w-auto">
      <ul ref={listRef} className="flex gap-1 overflow-x-auto px-3 py-1.5 font-semibold [scrollbar-width:none] md:px-6 lg:gap-6 lg:overflow-visible lg:p-0">
        {navLinks.map((link) => {
          const isActive = link.sectionId === activeId
          return (
            <li key={link.sectionId} className="shrink-0">
              <a
                href={`#${link.sectionId}`}
                aria-current={isActive ? 'true' : undefined}
                className={`block rounded-full px-3 py-2 text-sm decoration-cherry decoration-4 underline-offset-8 transition-colors duration-300 hover:underline lg:p-0 lg:text-base ${isActive ? ACTIVE_LINK_CLASS : ''}`}
              >
                {link.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

type Props = {
  businessName: string
  navLinks: readonly NavLink[]
  bookLabel: string
  onBook: () => void
}

export function SiteHeader({ businessName, navLinks, bookLabel, onBook }: Props) {
  const hasNav = navLinks.length > 0
  // On phones the nav row supplies the bottom spacing.
  const padding = hasNav ? 'pt-3 lg:py-3' : 'py-3'

  // Solid, not a translucent blur: a backdrop blur is recomputed on every scroll frame, which phones feel.
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-butter header-lift">
      <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-5 md:px-8 lg:flex-nowrap ${padding}`}>
        {/* Grows from zero width, so on a phone the name wraps instead of pushing the button to a new row. */}
        <a href={`#${SECTION_IDS.top}`} className="flex min-w-0 flex-1 basis-0 items-center gap-2 rounded-full lg:flex-none lg:basis-auto">
          <Kernel className="size-8 shrink-0 sm:size-9" />
          {/* Stacks onto two balanced lines on phones so the long name never pushes the button off-screen. */}
          <span className="max-w-38 font-display text-base leading-tight text-balance text-ink sm:max-w-none sm:text-2xl sm:whitespace-nowrap">
            {businessName}
          </span>
        </a>
        {hasNav && <SectionNav navLinks={navLinks} />}
        <BookButton onBook={onBook} className="shrink-0 px-4 py-2 text-sm whitespace-nowrap md:px-5 md:text-base">
          {bookLabel}
        </BookButton>
      </div>
    </header>
  )
}
