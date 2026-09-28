import { useState } from 'react'

import type { HeroContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { buttonClasses, Kernel } from '@/shared/ui'

import { usePauseOffscreen } from '../../lib/usePauseOffscreen'
import { type CartFlavor, CartControls } from './CartControls'
import { PopcornCart } from './PopcornCart'

// Staggered entrance, one step per headline line (the headline allows up to 4 lines).
const HEADLINE_LINE_DELAYS = [
  '',
  '[animation-delay:120ms]',
  '[animation-delay:240ms]',
  '[animation-delay:360ms]',
] as const

// Popcorn scattered in the page margins.
// Only shown on wide screens, where the margins are wide enough to keep clear of the copy.
const SCATTERED_KERNELS = [
  'top-[10%] left-[3%] size-10 -rotate-12',
  'top-[46%] left-[6%] size-7 rotate-45',
  'bottom-[12%] left-[2%] size-14 rotate-12',
  'top-[6%] right-[5%] size-8 rotate-90',
  'bottom-[20%] right-[2%] size-12 -rotate-45',
] as const

function headlineLines(headline: string): string[] {
  return headline
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function ScatteredKernels() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 hidden xl:block">
      {SCATTERED_KERNELS.map((placement) => (
        <Kernel key={placement} className={`absolute ${placement}`} />
      ))}
    </div>
  )
}

function InteractiveCart({ flavors }: { flavors: readonly CartFlavor[] }) {
  const [isLightOn, setIsLightOn] = useState(true)
  const [flavorIndex, setFlavorIndex] = useState<number | null>(null)
  const [spillCount, setSpillCount] = useState(0)
  // The owner can edit the flavor list (e.g. in the builder), so a stale pick falls back to classic.
  const flavorColor = flavorIndex === null ? null : (flavors[flavorIndex]?.color ?? null)

  // Picking a flavor in the dark switches the lights on, so the visitor sees it pop.
  function selectFlavor(index: number) {
    setFlavorIndex(index)
    setIsLightOn(true)
    setSpillCount((count) => count + 1)
  }

  return (
    <>
      <PopcornCart
        flavorColor={flavorColor}
        isLightOn={isLightOn}
        spillCount={spillCount}
        className="w-full"
      />
      <CartControls
        isLightOn={isLightOn}
        onToggleLight={() => setIsLightOn((isOn) => !isOn)}
        flavors={flavors}
        selectedFlavorIndex={flavorIndex}
        onSelectFlavor={selectFlavor}
      />
    </>
  )
}

type HeroArtProps = {
  image: HeroContent['image']
  flavors: readonly CartFlavor[]
}

// The cart (or the owner's photo) on its sunburst.
function HeroArt({ image, flavors }: HeroArtProps) {
  return (
    <div className="relative isolate mx-auto w-full max-w-[min(20rem,80vw)] animate-roll-in [animation-delay:200ms] sm:max-w-sm lg:max-w-md">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-conic-gradient(var(--color-butter-soft)_0deg_9deg,var(--color-butter)_9deg_18deg)]"
      />
      {image ? (
        <img
          src={image.url}
          alt={image.alt}
          // The largest thing above the fold: fetch it ahead of everything else.
          fetchPriority="high"
          className="aspect-[4/5] w-full rounded-[2rem] border-4 border-ink object-cover shadow-sign-lg"
        />
      ) : (
        <InteractiveCart flavors={flavors} />
      )}
    </div>
  )
}

// Hangs over the top of the next section, like the valance on the cart's awning.
function AwningEdge() {
  return (
    <div aria-hidden="true" className="relative z-10 h-0">
      <div className="absolute inset-x-0 top-0 drop-shadow-[0_3px_0_var(--color-ink)]">
        <div className="scallop-edge bg-butter" />
      </div>
    </div>
  )
}

type Props = {
  content: HeroContent
  // Hide "See packages" when the packages section is hidden, so it never links to nothing.
  showPackagesLink: boolean
  // The Flavors section's list, offered in the cart's flavor picker (empty when that section is hidden).
  flavors: readonly CartFlavor[]
  onBook: () => void
}

export function Hero({ content, showPackagesLink, flavors, onBook }: Props) {
  const loopingAreaRef = usePauseOffscreen<HTMLDivElement>()

  return (
    <>
      <section id={SECTION_IDS.top} className="relative isolate overflow-hidden bg-butter">
        <ScatteredKernels />
        <div
          ref={loopingAreaRef}
          className="mx-auto grid max-w-6xl items-center gap-[clamp(2.5rem,4vw,4rem)] px-5 pt-[clamp(2rem,5vw,4.5rem)] pb-[clamp(3.5rem,7vw,6rem)] md:px-8 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* Above the art, whose sunburst spreads wider than its column. */}
          <div className="relative z-10">
            {/* Two-layer sign lettering: a light inline gap before the color shadow keeps the
                letters crisp even when a theme's text and accent colors are close. */}
            <h1 className="font-display text-[clamp(2rem,1.1rem+4.3vw,4.5rem)] leading-[1.08] text-ink [text-shadow:2px_2px_0_var(--color-kernel),5px_5px_0_var(--color-cherry)] sm:[text-shadow:3px_3px_0_var(--color-kernel),7px_7px_0_var(--color-cherry)]">
              {headlineLines(content.headline).map((line, index) => (
                <span key={`${index}-${line}`} className={`block animate-rise ${HEADLINE_LINE_DELAYS[index] ?? ''}`}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-[clamp(1.25rem,2.5vw,1.75rem)] max-w-xl animate-rise text-[clamp(1.0625rem,1rem+0.3vw,1.25rem)] leading-relaxed [animation-delay:360ms]">
              {content.description}
            </p>
            {/* Full-width, thumb-sized buttons on phones; side by side from small tablets up. */}
            <div className="mt-[clamp(1.75rem,3vw,2.25rem)] flex animate-rise flex-col gap-4 [animation-delay:480ms] sm:flex-row sm:flex-wrap sm:items-center">
              <BookButton onBook={onBook} className="w-full px-8 py-4 text-lg sm:w-auto">
                {content.primaryCtaLabel}
              </BookButton>
              {showPackagesLink && (
                <a
                  href={`#${SECTION_IDS.packages}`}
                  className={buttonClasses('secondary', 'w-full px-8 py-4 text-lg sm:w-auto')}
                >
                  {content.secondaryCtaLabel}
                </a>
              )}
            </div>
            {content.highlights.length > 0 && (
              <ul className="mt-[clamp(1.75rem,3vw,2.25rem)] flex animate-rise flex-wrap gap-x-6 gap-y-2 font-semibold [animation-delay:600ms]">
                {content.highlights.map((highlight, index) => (
                  <li key={`${index}-${highlight}`} className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-2.5 rounded-full bg-cherry" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <HeroArt image={content.image} flavors={flavors} />
        </div>
      </section>
      <AwningEdge />
    </>
  )
}
