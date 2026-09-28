import type { SectionId } from '@/shared/config'

export type NavLink = {
  label: string
  sectionId: SectionId
}

// Each layout marks "you are here" its own way: a steady underline inline, a filled row in the menu.
const LAYOUT_CLASSES = {
  inline: {
    list: 'flex gap-6',
    link: 'block py-2 decoration-cherry decoration-4 underline-offset-8 transition-colors duration-300 hover:underline',
    active: 'underline',
  },
  menu: {
    list: 'flex flex-col gap-1',
    link: 'flex min-h-12 items-center rounded-xl px-4 text-lg hover:bg-butter-soft',
    active: 'bg-ink text-butter hover:bg-ink',
  },
} as const

type Props = {
  id?: string
  navLinks: readonly NavLink[]
  activeId: string | null
  layout: keyof typeof LAYOUT_CLASSES
  className?: string
  // Lets the menu close once the visitor picks a section.
  onNavigate?: () => void
}

export function SectionNav({ id, navLinks, activeId, layout, className = '', onNavigate }: Props) {
  const classes = LAYOUT_CLASSES[layout]

  return (
    <nav id={id} aria-label="Main" className={className}>
      <ul className={`font-semibold ${classes.list}`}>
        {navLinks.map((link) => {
          const isActive = link.sectionId === activeId
          return (
            <li key={link.sectionId}>
              <a
                href={`#${link.sectionId}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={onNavigate}
                className={`${classes.link} ${isActive ? classes.active : ''}`}
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
