import { FLAVOR_COLOR_OPTIONS, type FlavorsContent } from '@/entities/site'
import { SECTION_IDS } from '@/shared/config'

type Props = {
  content: FlavorsContent
}

export function Flavors({ content }: Props) {
  return (
    <section id={SECTION_IDS.flavors} className="section-anchor border-y-2 border-ink bg-butter-soft py-14 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:gap-12 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed">{content.description}</p>
        </div>
        <ul className="flex flex-wrap gap-3 sm:gap-4">
          {content.items.map((flavor, index) => (
            <li
              key={`${index}-${flavor.name}`}
              className={`reveal reveal-pop rounded-full border-2 border-ink px-4 py-2 font-display text-lg shadow-sign sm:px-6 sm:py-3 sm:text-xl md:text-2xl ${FLAVOR_COLOR_OPTIONS[flavor.color].className}`}
            >
              {flavor.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
