import { useState } from 'react'

import type { HeroContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { buttonClasses, Kernel } from '@/shared/ui'

import { usePointerParallax } from '../../lib/usePointerParallax'
import { type CartFlavor, CartControls } from './CartControls'
import { PopcornCart } from './PopcornCart'

// Staggered entrance, one step per headline line (the headline allows up to 4 lines).
const HEADLINE_LINE_DELAYS = [
  '',
  '[animation-delay:120ms]',
  '[animation-delay:240ms]',
  '[animation-delay:360ms]',
] as const

// Popcorn drifting in the page margins, each piece scrolling at its own speed for depth.
// Only shown on wide screens, where the margins are wide enough to keep clear of the copy.
const DRIFTING_KERNELS = [
  'top-[10%] left-[3%] size-10 -rotate-12 [--parallax-distance:-140px]',
  'top-[46%] left-[6%] size-7 rotate-45 [--parallax-distance:-230px]',
  'bottom-[12%] left-[2%] size-14 rotate-12 [--parallax-distance:-90px]',
  'top-[6%] right-[5%] size-8 rotate-90 [--parallax-distance:-200px]',
  'bottom-[20%] right-[2%] size-12 -rotate-45 [--parallax-distance:-120px]',
] as const

function headlineLines(headline: string): string[] {
  return headline
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function DriftingKernels() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 hidden pointer-shift [--pointer-depth:-24px] xl:block">
      {DRIFTING_KERNELS.map((placement) => (
        <Kernel key={placement} className={`absolute parallax ${placement}`} />
      ))}
    </div>
  )
}

function InteractiveCart({ flavors }: { flavors: readonly CartFlavor[] }) {
  const [isLightOn, setIsLightOn] = useState(true)
  const [flavorIndex, setFlavorIndex] = useState<number | null>(null)
  // The owner can edit the flavor list (e.g. in the builder), so a stale pick falls back to classic.
  const flavorColor = flavorIndex === null ? null : (flavors[flavorIndex]?.color ?? null)

  // Picking a flavor in the dark switches the lights on, so the visitor sees it pop.
  function selectFlavor(index: number) {
    setFlavorIndex(index)
    setIsLightOn(true)
  }

  return (
    <>
      {/* Only the cart follows the pointer; the controls hold still so they're easy to hit. */}
      <div className="pointer-shift [--pointer-depth:14px]">
        <PopcornCart
          flavorColor={flavorColor}
          isLightOn={isLightOn}
          className="w-full drop-shadow-[8px_8px_0_color-mix(in_srgb,var(--color-ink)_25%,transparent)]"
        />
      </div>
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

// The cart (or the owner's photo) on its sunburst. Layers move at different depths with the
// pointer and the scroll: the sunburst sinks back while the art comes forward.
function HeroArt({ image, flavors }: HeroArtProps) {
  return (
    <div className="relative isolate mx-auto w-full max-w-sm animate-roll-in [animation-delay:200ms] sm:max-w-md">
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-shift [--pointer-depth:-16px]">
        <div className="absolute top-1/2 left-1/2 aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-conic-gradient(var(--color-butter-soft)_0deg_9deg,var(--color-butter)_9deg_18deg)] parallax-spin" />
      </div>
      <div className="parallax [--parallax-distance:-70px]">
        {image ? (
          <div className="pointer-shift [--pointer-depth:14px]">
            <img
              src={image.url}
              alt={image.alt}
              className="aspect-[4/5] w-full rounded-[2rem] border-4 border-ink object-cover shadow-sign-lg"
            />
          </div>
        ) : (
          <InteractiveCart flavors={flavors} />
        )}
      </div>
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
  const pointerAreaRef = usePointerParallax<HTMLElement>()

  return (
    <>
      <section ref={pointerAreaRef} id={SECTION_IDS.top} className="relative isolate overflow-hidden bg-butter">
        <DriftingKernels />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:pt-16 lg:pb-28">
          {/* The copy lags behind the scroll, so the art seems to sit in front of it. */}
          <div className="parallax">
            {/* Two-layer sign lettering: a light inline gap before the color shadow keeps the
                letters crisp even when a theme's text and accent colors are close. */}
            <h1 className="font-display text-[2.6rem] leading-[1.08] text-ink [text-shadow:2px_2px_0_var(--color-kernel),5px_5px_0_var(--color-cherry)] sm:text-6xl sm:[text-shadow:3px_3px_0_var(--color-kernel),7px_7px_0_var(--color-cherry)] lg:text-[4.1rem] xl:text-7xl">
              {headlineLines(content.headline).map((line, index) => (
                <span key={`${index}-${line}`} className={`block animate-rise ${HEADLINE_LINE_DELAYS[index] ?? ''}`}>
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed [animation-delay:360ms] md:text-xl">
              {content.description}
            </p>
            <div className="mt-9 flex animate-rise flex-wrap items-center gap-4 [animation-delay:480ms]">
              <BookButton onBook={onBook} className="px-8 py-4 text-lg">{content.primaryCtaLabel}</BookButton>
              {showPackagesLink && (
                <a href={`#${SECTION_IDS.packages}`} className={buttonClasses('secondary', 'px-8 py-4 text-lg')}>
                  {content.secondaryCtaLabel}
                </a>
              )}
            </div>
            {content.highlights.length > 0 && (
              <ul className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-2 font-semibold [animation-delay:600ms]">
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
