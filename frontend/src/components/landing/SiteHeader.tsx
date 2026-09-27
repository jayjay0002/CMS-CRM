import { BUSINESS, NAV_LINKS } from '../../features/site/content'
import { Kernel } from '../ui/Kernel'
import { BookButton } from './BookButton'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-butter/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="#top" className="flex items-center gap-2 rounded-full">
          <Kernel className="size-8 shrink-0 sm:size-9" />
          <span className="font-display text-xl whitespace-nowrap text-ink sm:text-2xl">{BUSINESS.name}</span>
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6 font-semibold">
            {NAV_LINKS.map((link) => (
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
        <BookButton className="px-4 py-2 text-sm whitespace-nowrap md:px-5 md:text-base">Book the cart</BookButton>
      </div>
    </header>
  )
}
