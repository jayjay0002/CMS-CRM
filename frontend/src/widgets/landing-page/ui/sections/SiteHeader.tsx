import { BookButton } from '@/features/start-booking'
import { SECTION_IDS, type SectionId } from '@/shared/config'
import { Kernel } from '@/shared/ui'

export type NavLink = {
  label: string
  sectionId: SectionId
}

type Props = {
  businessName: string
  navLinks: readonly NavLink[]
  bookLabel: string
  onBook: () => void
}

export function SiteHeader({ businessName, navLinks, bookLabel, onBook }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-butter/95 backdrop-blur header-lift">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href={`#${SECTION_IDS.top}`} className="flex items-center gap-2 rounded-full">
          <Kernel className="size-8 shrink-0 sm:size-9" />
          {/* Stacks onto two balanced lines on phones so the long name never pushes the button off-screen. */}
          <span className="max-w-38 font-display text-base leading-tight text-balance text-ink sm:max-w-none sm:text-2xl sm:whitespace-nowrap">
            {businessName}
          </span>
        </a>
        {navLinks.length > 0 && (
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6 font-semibold">
              {navLinks.map((link) => (
                <li key={link.sectionId}>
                  <a
                    href={`#${link.sectionId}`}
                    className="decoration-cherry decoration-4 underline-offset-8 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <BookButton onBook={onBook} className="px-4 py-2 text-sm whitespace-nowrap md:px-5 md:text-base">{bookLabel}</BookButton>
      </div>
    </header>
  )
}
