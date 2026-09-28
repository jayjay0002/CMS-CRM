import { FLAVOR_COLORS, type FlavorColor } from '@/entities/site'
import { KernelShape } from '@/shared/ui'

import { lightClass } from './cartLight'
import { MarqueeBulbs } from './CartLights'
import { KettleSpill } from './KettleSpill'
import { CartShadow, CartWheels } from './CartWheels'

const KERNEL_SYMBOL_ID = 'cart-kernel'
const STRIPES_ID = 'cart-stripes'
const GLASS_CLIP_ID = 'cart-glass'
const GLOW_ID = 'cart-glow'

const PILE_KERNEL_SIZE = 38
const PILE_KERNEL_CENTER = PILE_KERNEL_SIZE / 2
const POPPING_KERNEL_SIZE = 30

const SCALLOP_COUNT = 10
const SCALLOP_RADIUS = 14
const SCALLOP_DIAMETER = SCALLOP_RADIUS * 2
const CANOPY_LEFT = 40
const CANOPY_BOTTOM = 96

// Popcorn tint per flavor color, read by every kernel in the case through --popcorn-color.
const POPCORN_COLOR_CLASSES: Record<FlavorColor, string> = {
  [FLAVOR_COLORS.butter]: '[--popcorn-color:var(--color-butter)]',
  [FLAVOR_COLORS.kernel]: '[--popcorn-color:var(--color-kernel)]',
  [FLAVOR_COLORS.caramel]: '[--popcorn-color:var(--color-caramel)]',
  [FLAVOR_COLORS.butterSoft]: '[--popcorn-color:var(--color-butter-soft)]',
  [FLAVOR_COLORS.ink]: '[--popcorn-color:var(--color-ink)]',
  [FLAVOR_COLORS.cherry]: '[--popcorn-color:var(--color-cherry)]',
}
const CLASSIC_POPCORN_CLASS = POPCORN_COLOR_CLASSES[FLAVOR_COLORS.kernel]

// Each kernel eases to its new color after its own delay, so a flavor change ripples through the heap.
const KERNEL_BODY_CLASS =
  'fill-(--popcorn-color) transition-[fill] duration-500 [transition-delay:var(--popcorn-delay,0ms)]'
const PILE_RIPPLE_CLASS =
  '[&>g:nth-child(3n+2)]:[--popcorn-delay:120ms] [&>g:nth-child(3n)]:[--popcorn-delay:240ms]'

// The heap of popped corn resting on the floor of the glass case, bottom row first.
const PILE = [
  { x: 60, y: 292, r: 0, row: 0 },
  { x: 92, y: 294, r: 40, row: 0 },
  { x: 124, y: 290, r: 110, row: 0 },
  { x: 156, y: 294, r: 200, row: 0 },
  { x: 188, y: 290, r: 70, row: 0 },
  { x: 220, y: 294, r: 160, row: 0 },
  { x: 252, y: 290, r: 20, row: 0 },
  { x: 72, y: 268, r: 250, row: 1 },
  { x: 104, y: 266, r: 90, row: 1 },
  { x: 138, y: 268, r: 300, row: 1 },
  { x: 172, y: 264, r: 130, row: 1 },
  { x: 206, y: 268, r: 10, row: 1 },
  { x: 240, y: 266, r: 280, row: 1 },
  { x: 92, y: 244, r: 60, row: 2 },
  { x: 128, y: 242, r: 180, row: 2 },
  { x: 164, y: 240, r: 330, row: 2 },
  { x: 200, y: 244, r: 100, row: 2 },
  { x: 232, y: 246, r: 220, row: 2 },
  { x: 118, y: 222, r: 140, row: 3 },
  { x: 156, y: 218, r: 20, row: 3 },
  { x: 194, y: 222, r: 260, row: 3 },
] as const

// When the light comes on the heap pops up row by row, from the floor of the case upward.
const POP_ROW_DELAYS = ['delay-0', 'delay-150', 'delay-300', 'delay-450'] as const
const POP_IN_CLASS =
  'origin-center [transform-box:fill-box] transition-[scale,opacity] duration-500 ease-[cubic-bezier(0.3,1.6,0.5,1)]'

// Unpopped kernels on the floor of the case, seen while the light is off.
const UNPOPPED = [
  { x: 96, y: 318 },
  { x: 130, y: 320 },
  { x: 170, y: 317 },
  { x: 212, y: 320 },
  { x: 250, y: 318 },
] as const

// Kernels bouncing up off the heap. Negative delays start them mid-hop so they never sync up.
const POPPING = [
  { id: 'a', x: 120, y: 200, className: '[--kx:14px] [--ky:-70px] [--kr:140deg] [animation-delay:-0.2s]' },
  { id: 'b', x: 168, y: 190, className: '[--kx:-18px] [--ky:-50px] [--kr:-120deg] [animation-delay:-0.9s]' },
  { id: 'c', x: 214, y: 204, className: '[--kx:10px] [--ky:-80px] [--kr:200deg] [animation-delay:-1.3s]' },
  { id: 'd', x: 92, y: 214, className: '[--kx:20px] [--ky:-45px] [--kr:-90deg] [animation-delay:-0.6s]' },
  { id: 'e', x: 244, y: 216, className: '[--kx:-12px] [--ky:-60px] [--kr:110deg] [animation-delay:-1.6s]' },
  { id: 'f', x: 148, y: 206, className: '[--kx:-6px] [--ky:-88px] [--kr:-200deg] [animation-delay:-0.4s]' },
] as const

function PopcornPile({ isLightOn }: { isLightOn: boolean }) {
  return (
    <g className={PILE_RIPPLE_CLASS}>
      {PILE.map((kernel) => (
        <g
          key={`${kernel.x}-${kernel.y}`}
          className={`${POP_IN_CLASS} ${isLightOn ? `scale-100 opacity-100 ${POP_ROW_DELAYS[kernel.row]}` : 'scale-0 opacity-0'}`}
        >
          <use
            href={`#${KERNEL_SYMBOL_ID}`}
            x={kernel.x}
            y={kernel.y}
            width={PILE_KERNEL_SIZE}
            height={PILE_KERNEL_SIZE}
            transform={`rotate(${kernel.r} ${kernel.x + PILE_KERNEL_CENTER} ${kernel.y + PILE_KERNEL_CENTER})`}
          />
        </g>
      ))}
    </g>
  )
}

function PoppingKernels({ isLightOn }: { isLightOn: boolean }) {
  return (
    <g className={lightClass(isLightOn)}>
      {/* Each kernel is placed by its group, not the use's x/y: Chrome turns a use placed with x/y
          around the wrong point, which swung most of these out of the glass. */}
      {POPPING.map((kernel) => (
        <g key={kernel.id} transform={`translate(${kernel.x} ${kernel.y})`}>
          <use
            href={`#${KERNEL_SYMBOL_ID}`}
            width={POPPING_KERNEL_SIZE}
            height={POPPING_KERNEL_SIZE}
            className={`animate-kernel-bounce origin-center [transform-box:fill-box] ${kernel.className} ${isLightOn ? '' : '[animation-play-state:paused]'}`}
          />
        </g>
      ))}
    </g>
  )
}

// The glass case: warm and full of popcorn with the light on, dim and empty with it off.
function GlassCase({ isLightOn, spillCount }: { isLightOn: boolean; spillCount: number }) {
  return (
    <>
      <rect x="60" y="104" width="240" height="222" className="fill-butter-soft stroke-ink" strokeWidth="5" />
      <g clipPath={`url(#${GLASS_CLIP_ID})`}>
        <rect x="62" y="106" width="236" height="218" fill={`url(#${GLOW_ID})`} className={lightClass(isLightOn)} />
        {UNPOPPED.map((kernel) => (
          <ellipse key={kernel.x} cx={kernel.x} cy={kernel.y} rx="5" ry="3.5" className="fill-caramel" />
        ))}
        <PopcornPile isLightOn={isLightOn} />
        <PoppingKernels isLightOn={isLightOn} />
        {/* Drawn under the kettle, so each batch appears from behind its rim. A new key replays it. */}
        {spillCount > 0 && <KettleSpill key={spillCount} kernelHref={`#${KERNEL_SYMBOL_ID}`} />}
        {/* Kettle */}
        <rect x="176" y="104" width="8" height="28" className="fill-ink" />
        <path
          d="M136 132 h88 a6 6 0 0 1 6 6 v16 a26 26 0 0 1 -26 26 h-48 a26 26 0 0 1 -26 -26 v-16 a6 6 0 0 1 6 -6z"
          className="fill-ink"
        />
        <rect x="148" y="140" width="30" height="6" rx="3" className="fill-kernel/30" />
        {/* Dim glass while the light is off */}
        <rect x="62" y="106" width="236" height="218" className={`fill-ink/55 ${lightClass(!isLightOn)}`} />
        {/* Lamp hanging from the roof of the case */}
        <line x1="262" y1="106" x2="262" y2="118" className="stroke-ink" strokeWidth="3" />
        <circle cx="262" cy="126" r="26" className={`fill-butter/50 ${lightClass(isLightOn)}`} />
        <circle
          cx="262"
          cy="126"
          r="8"
          className={`stroke-ink transition-[fill] duration-500 ${isLightOn ? 'fill-butter-soft' : 'fill-kernel/40'}`}
          strokeWidth="3"
        />
        {/* Glare on the glass */}
        <polygon points="80,112 102,112 86,322 70,322" className="fill-white/50" />
        <polygon points="110,112 118,112 102,322 96,322" className="fill-white/40" />
      </g>
      <rect x="60" y="104" width="240" height="222" fill="none" className="stroke-ink" strokeWidth="5" />
    </>
  )
}

type Props = {
  className?: string
  // Tints the popcorn; null is classic white.
  flavorColor?: FlavorColor | null
  // Off empties the glass case and switches the marquee bulbs off.
  isLightOn?: boolean
  // Goes up by one per flavor pick; each new value spills a batch out of the kettle.
  spillCount?: number
}

export function PopcornCart({ className = '', flavorColor = null, isLightOn = true, spillCount = 0 }: Props) {
  const popcornClass = flavorColor ? POPCORN_COLOR_CLASSES[flavorColor] : CLASSIC_POPCORN_CLASS

  return (
    <svg
      viewBox="0 0 370 520"
      className={`group/cart ${popcornClass} ${className}`}
      role="img"
      aria-label={
        isLightOn
          ? 'A striped popcorn cart with its lights on and fresh popcorn popping inside the glass case'
          : 'A striped popcorn cart with its lights off and only unpopped kernels in the glass case'
      }
    >
      <defs>
        <symbol id={KERNEL_SYMBOL_ID} viewBox="0 0 40 40">
          <KernelShape bodyClassName={KERNEL_BODY_CLASS} />
        </symbol>
        <radialGradient id={GLOW_ID} cx="0.85" cy="0.1" r="0.95">
          <stop offset="0" stopOpacity="0.85" className="[stop-color:var(--color-butter)]" />
          <stop offset="1" stopOpacity="0" className="[stop-color:var(--color-butter)]" />
        </radialGradient>
        <pattern id={STRIPES_ID} width="36" height="10" patternUnits="userSpaceOnUse">
          <rect width="18" height="10" className="fill-cherry" />
          <rect x="18" width="18" height="10" className="fill-kernel" />
        </pattern>
        <clipPath id={GLASS_CLIP_ID}>
          <rect x="62" y="106" width="236" height="218" />
        </clipPath>
      </defs>

      <ellipse cx="180" cy="508" rx="150" ry="10" className="fill-ink/20" />
      <CartShadow />

      {/* The body rides on the wheels: it rumbles while the cart is hovered and the wheels drive. */}
      <g className="group-hover/cart:animate-cart-rumble">
        {/* Canopy */}
        {Array.from({ length: SCALLOP_COUNT }, (_, index) => (
          <circle
            key={index}
            cx={CANOPY_LEFT + SCALLOP_RADIUS + index * SCALLOP_DIAMETER}
            cy={CANOPY_BOTTOM}
            r={SCALLOP_RADIUS}
            className="fill-cherry-deep"
          />
        ))}
        <path
          d="M36 96 L74 34 H286 L324 96 Z"
          fill={`url(#${STRIPES_ID})`}
          className="stroke-ink"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect x="66" y="24" width="228" height="16" rx="8" className="fill-butter stroke-ink" strokeWidth="4" />
        <circle cx="180" cy="16" r="10" className="fill-cherry stroke-ink" strokeWidth="4" />

        <GlassCase isLightOn={isLightOn} spillCount={spillCount} />

        {/* Cabinet and sign; the sign glows while the lights are on */}
        <rect x="44" y="326" width="272" height="112" rx="12" className="fill-cherry stroke-ink" strokeWidth="5" />
        <rect x="40" y="318" width="280" height="16" rx="6" className="fill-butter stroke-ink" strokeWidth="4" />
        <rect x="78" y="344" width="204" height="76" rx="38" className={`fill-butter/60 ${lightClass(isLightOn)}`} />
        <rect x="86" y="352" width="188" height="60" rx="30" className="fill-kernel stroke-ink" strokeWidth="4" />
        <text x="180" y="394" textAnchor="middle" fontSize="36" className="fill-cherry font-display">
          Popcorn
        </text>

        <MarqueeBulbs isLightOn={isLightOn} />

        {/* Handle */}
        <path d="M316 356 C 340 356 344 336 356 326" fill="none" className="stroke-ink" strokeWidth="7" strokeLinecap="round" />
        <circle cx="356" cy="324" r="8" className="fill-butter stroke-ink" strokeWidth="4" />
      </g>

      <CartWheels />
    </svg>
  )
}
