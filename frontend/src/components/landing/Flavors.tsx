import { FLAVORS, SECTION_IDS } from '../../features/site/content'

export function Flavors() {
  return (
    <section id={SECTION_IDS.flavors} className="scroll-mt-20 border-y-2 border-ink bg-butter-soft py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <h2 className="font-display text-5xl text-ink md:text-6xl">Pick your flavors</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed">
            Every package starts with classic butter. Bigger packages add more flavors, and we can
            match the bags to your wedding colors.
          </p>
        </div>
        <ul className="flex flex-wrap gap-4">
          {FLAVORS.map((flavor) => (
            <li
              key={flavor.name}
              className={`rounded-full border-2 border-ink px-6 py-3 font-display text-xl shadow-sign md:text-2xl ${flavor.className}`}
            >
              {flavor.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
