import { KernelShape } from '@/shared/ui'

const KERNEL_SYMBOL_ID = 'cart-kernel'
const STRIPES_ID = 'cart-stripes'
const GLASS_CLIP_ID = 'cart-glass'

const PILE_KERNEL_SIZE = 38
const PILE_KERNEL_CENTER = PILE_KERNEL_SIZE / 2
const POPPING_KERNEL_SIZE = 30

const SCALLOP_COUNT = 10
const SCALLOP_RADIUS = 14
const SCALLOP_DIAMETER = SCALLOP_RADIUS * 2
const CANOPY_LEFT = 40
const CANOPY_BOTTOM = 96

const SPOKE_COUNT = 8
const FULL_TURN_DEG = 360
const WHEEL_RADIUS = 44
const WHEEL_CENTER_Y = 462
const WHEELS = [
  { id: 'back', cx: 104 },
  { id: 'front', cx: 256 },
] as const

// The heap of popped corn resting on the floor of the glass case.
const PILE = [
  { x: 60, y: 292, r: 0 },
  { x: 92, y: 294, r: 40 },
  { x: 124, y: 290, r: 110 },
  { x: 156, y: 294, r: 200 },
  { x: 188, y: 290, r: 70 },
  { x: 220, y: 294, r: 160 },
  { x: 252, y: 290, r: 20 },
  { x: 72, y: 268, r: 250 },
  { x: 104, y: 266, r: 90 },
  { x: 138, y: 268, r: 300 },
  { x: 172, y: 264, r: 130 },
  { x: 206, y: 268, r: 10 },
  { x: 240, y: 266, r: 280 },
  { x: 92, y: 244, r: 60 },
  { x: 128, y: 242, r: 180 },
  { x: 164, y: 240, r: 330 },
  { x: 200, y: 244, r: 100 },
  { x: 232, y: 246, r: 220 },
  { x: 118, y: 222, r: 140 },
  { x: 156, y: 218, r: 20 },
  { x: 194, y: 222, r: 260 },
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

type Props = {
  className?: string
}

export function PopcornCart({ className }: Props) {
  return (
    <svg
      viewBox="0 0 370 520"
      className={className}
      role="img"
      aria-label="A red and white striped popcorn cart with fresh popcorn popping inside its glass case"
    >
      <defs>
        <symbol id={KERNEL_SYMBOL_ID} viewBox="0 0 40 40">
          <KernelShape />
        </symbol>
        <pattern id={STRIPES_ID} width="36" height="10" patternUnits="userSpaceOnUse">
          <rect width="18" height="10" className="fill-cherry" />
          <rect x="18" width="18" height="10" className="fill-kernel" />
        </pattern>
        <clipPath id={GLASS_CLIP_ID}>
          <rect x="62" y="106" width="236" height="218" />
        </clipPath>
      </defs>

      <ellipse cx="180" cy="508" rx="150" ry="10" className="fill-ink/20" />

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

      {/* Glass case with the popcorn inside */}
      <rect x="60" y="104" width="240" height="222" className="fill-butter-soft stroke-ink" strokeWidth="5" />
      <g clipPath={`url(#${GLASS_CLIP_ID})`}>
        {PILE.map((kernel) => (
          <use
            key={`${kernel.x}-${kernel.y}`}
            href={`#${KERNEL_SYMBOL_ID}`}
            x={kernel.x}
            y={kernel.y}
            width={PILE_KERNEL_SIZE}
            height={PILE_KERNEL_SIZE}
            transform={`rotate(${kernel.r} ${kernel.x + PILE_KERNEL_CENTER} ${kernel.y + PILE_KERNEL_CENTER})`}
          />
        ))}
        {POPPING.map((kernel) => (
          <use
            key={kernel.id}
            href={`#${KERNEL_SYMBOL_ID}`}
            x={kernel.x}
            y={kernel.y}
            width={POPPING_KERNEL_SIZE}
            height={POPPING_KERNEL_SIZE}
            className={`animate-kernel-bounce origin-center [transform-box:fill-box] ${kernel.className}`}
          />
        ))}
        {/* Kettle */}
        <rect x="176" y="104" width="8" height="28" className="fill-ink" />
        <path
          d="M136 132 h88 a6 6 0 0 1 6 6 v16 a26 26 0 0 1 -26 26 h-48 a26 26 0 0 1 -26 -26 v-16 a6 6 0 0 1 6 -6z"
          className="fill-ink"
        />
        <rect x="148" y="140" width="30" height="6" rx="3" className="fill-kernel/30" />
        {/* Glare on the glass */}
        <polygon points="80,112 102,112 86,322 70,322" className="fill-white/50" />
        <polygon points="110,112 118,112 102,322 96,322" className="fill-white/40" />
      </g>
      <rect x="60" y="104" width="240" height="222" fill="none" className="stroke-ink" strokeWidth="5" />

      {/* Cabinet and sign */}
      <rect x="44" y="326" width="272" height="112" rx="12" className="fill-cherry stroke-ink" strokeWidth="5" />
      <rect x="40" y="318" width="280" height="16" rx="6" className="fill-butter stroke-ink" strokeWidth="4" />
      <rect x="86" y="352" width="188" height="60" rx="30" className="fill-kernel stroke-ink" strokeWidth="4" />
      <text x="180" y="394" textAnchor="middle" fontSize="36" className="fill-cherry font-display">
        Popcorn
      </text>

      {/* Handle */}
      <path d="M316 356 C 340 356 344 336 356 326" fill="none" className="stroke-ink" strokeWidth="7" strokeLinecap="round" />
      <circle cx="356" cy="324" r="8" className="fill-butter stroke-ink" strokeWidth="4" />

      {/* Wheels */}
      {WHEELS.map((wheel) => (
        <g key={wheel.id}>
          {Array.from({ length: SPOKE_COUNT }, (_, index) => (
            <line
              key={index}
              x1={wheel.cx}
              y1={WHEEL_CENTER_Y}
              x2={wheel.cx}
              y2={WHEEL_CENTER_Y - WHEEL_RADIUS}
              className="stroke-ink"
              strokeWidth="4"
              transform={`rotate(${(index * FULL_TURN_DEG) / SPOKE_COUNT} ${wheel.cx} ${WHEEL_CENTER_Y})`}
            />
          ))}
          <circle cx={wheel.cx} cy={WHEEL_CENTER_Y} r={WHEEL_RADIUS} fill="none" className="stroke-ink" strokeWidth="9" />
          <circle cx={wheel.cx} cy={WHEEL_CENTER_Y} r="10" className="fill-butter stroke-ink" strokeWidth="4" />
        </g>
      ))}
    </svg>
  )
}
