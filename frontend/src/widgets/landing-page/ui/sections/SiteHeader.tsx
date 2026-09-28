import { type RefObject, useId } from 'react'

import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { Kernel } from '@/shared/ui'

import { useActiveSection } from '../../lib/useActiveSection'
import { useNavMenu } from '../../lib/useNavMenu'
import { type NavLink, SectionNav } from './SectionNav'

export type { NavLink } from './SectionNav'

// The three bars of the menu icon fold into an X while the menu is open.
const MENU_BAR = 'block h-0.5 w-5 rounded-full bg-ink transition-[translate,rotate,opacity] duration-200'

type MenuToggleProps = {
  isOpen: boolean
  menuId: string
  toggleRef: RefObject<HTMLButtonElement | null>
  onToggle: () => void
}

function MenuToggle({ isOpen, menuId, toggleRef, onToggle }: MenuToggleProps) {
  return (
    <button
      ref={toggleRef}
      type="button"
      aria-expanded={isOpen}
      aria-controls={menuId}
      onClick={onToggle}
      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-kernel shadow-sign transition-[translate,box-shadow] duration-150 hover:translate-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] lg:hidden"
    >
      <span className="sr-only">Menu</span>
      <span aria-hidden="true" className="flex flex-col gap-1">
        <span className={`${MENU_BAR} ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
        <span className={`${MENU_BAR} ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`${MENU_BAR} ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
      </span>
    </button>
  )
}

type Props = {
  businessName: string
  navLinks: readonly NavLink[]
  bookLabel: string
  onBook: () => void
}

// Sticky and solid (a translucent backdrop blur is recomputed on every scroll frame, which phones
// feel). Wide screens show the links inline; smaller ones fold them into a menu under the bar,
// so "Book" always stays in reach without a swipe.
export function SiteHeader({ businessName, navLinks, bookLabel, onBook }: Props) {
  const menuId = useId()
  const hasNav = navLinks.length > 0
  const activeId = useActiveSection(navLinks.map((link) => link.sectionId))
  const { isMenuOpen, headerRef, toggleRef, toggleMenu, closeMenu } = useNavMenu()

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b-2 border-ink bg-butter header-lift">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <a href={`#${SECTION_IDS.top}`} className="flex min-w-0 items-center gap-2 rounded-full">
          <Kernel className="size-9 shrink-0 min-[22.5rem]:size-8 sm:size-9" />
          {/* Wraps onto balanced lines on phones. Below 360px there is no room beside the buttons, so the
              kernel stands in for the logo there and the name is left for screen readers. */}
          <span className="font-display text-[clamp(0.875rem,0.6rem+1.2vw,1.5rem)] leading-tight text-balance text-ink max-[22.5rem]:sr-only sm:whitespace-nowrap">
            {businessName}
          </span>
        </a>
        {hasNav && <SectionNav navLinks={navLinks} activeId={activeId} layout="inline" className="hidden lg:block" />}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <BookButton onBook={onBook} className="min-h-11 px-3.5 py-2 text-sm whitespace-nowrap min-[25rem]:px-4 md:px-5 md:text-base">
            {bookLabel}
          </BookButton>
          {hasNav && <MenuToggle isOpen={isMenuOpen} menuId={menuId} toggleRef={toggleRef} onToggle={toggleMenu} />}
        </div>
      </div>
      {hasNav && (
        <div
          id={menuId}
          hidden={!isMenuOpen}
          className="absolute inset-x-0 top-full border-b-2 border-ink bg-kernel shadow-[0_6px_0_color-mix(in_srgb,var(--color-ink)_18%,transparent)] lg:hidden"
        >
          <SectionNav
            navLinks={navLinks}
            activeId={activeId}
            layout="menu"
            className="mx-auto max-w-6xl px-3 py-3 md:px-6"
            onNavigate={closeMenu}
          />
        </div>
      )}
    </header>
  )
}
