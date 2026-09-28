const SPOKE_COUNT = 8
const FULL_TURN_DEG = 360
const WHEEL_RADIUS = 44
const WHEEL_CENTER_Y = 462
const WHEELS = [
  { id: 'back', cx: 104 },
  { id: 'front', cx: 256 },
] as const

// Every layer turns around the hub: the wheel's bounding box is centered on it.
const AROUND_HUB = 'origin-center [transform-box:fill-box]'
// Driving on hover: the wheels always run but sit paused until the cart is hovered, so they
// stop wherever they are when the pointer leaves instead of snapping back.
const WHEEL_DRIVE_CLASS =
  'animate-wheel-drive [animation-play-state:paused] group-hover/cart:[animation-play-state:running]'

// A spoked wheel: rolls as the cart arrives, and again while the cart is hovered.
function Wheel({ cx }: { cx: number }) {
  return (
    <g className={`${AROUND_HUB} animate-wheel-roll-in`}>
      <g className={`${AROUND_HUB} ${WHEEL_DRIVE_CLASS}`}>
        {Array.from({ length: SPOKE_COUNT }, (_, index) => (
          <line
            key={index}
            x1={cx}
            y1={WHEEL_CENTER_Y}
            x2={cx}
            y2={WHEEL_CENTER_Y - WHEEL_RADIUS}
            className="stroke-ink"
            strokeWidth="4"
            transform={`rotate(${(index * FULL_TURN_DEG) / SPOKE_COUNT} ${cx} ${WHEEL_CENTER_Y})`}
          />
        ))}
        <circle cx={cx} cy={WHEEL_CENTER_Y} r={WHEEL_RADIUS} fill="none" className="stroke-ink" strokeWidth="9" />
        <circle cx={cx} cy={WHEEL_CENTER_Y} r="10" className="fill-butter stroke-ink" strokeWidth="4" />
      </g>
    </g>
  )
}

export function CartWheels() {
  return WHEELS.map((wheel) => <Wheel key={wheel.id} cx={wheel.cx} />)
}

// A flat offset shadow behind the cart's main shapes, drawn once. It stands in for a CSS
// drop-shadow filter, which would re-render the whole cart on every frame of its animations.
export function CartShadow() {
  return (
    <g className="fill-ink/25" transform="translate(8 8)">
      <path d="M36 96 L74 34 H286 L324 96 Z" />
      <rect x="64" y="22" width="232" height="20" rx="10" />
      <rect x="38" y="84" width="284" height="26" rx="13" />
      <rect x="58" y="102" width="244" height="226" />
      <rect x="38" y="316" width="284" height="124" rx="12" />
      {/* Rings, not discs: the wheels are open, so only the rim casts a shadow. */}
      {WHEELS.map((wheel) => (
        <circle
          key={wheel.id}
          cx={wheel.cx}
          cy={WHEEL_CENTER_Y}
          r={WHEEL_RADIUS}
          fill="none"
          className="stroke-ink/25"
          strokeWidth="9"
        />
      ))}
    </g>
  )
}
