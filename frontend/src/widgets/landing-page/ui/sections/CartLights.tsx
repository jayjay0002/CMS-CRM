import { lightClass } from './cartLight'

// Marquee bulbs along the crest of the roof and the ledge above the cabinet.
const BULBS_PER_ROW = 9
const BULB_ROWS = [
  { id: 'crest', startX: 82, endX: 278, y: 32 },
  { id: 'ledge', startX: 58, endX: 302, y: 326 },
] as const

// Switching on, the bulbs light one after another along each row, like a sign powering up
// (one delay per bulb, BULBS_PER_ROW of them). Switching off cuts them all at once.
const BULB_POWER_ON_DELAYS = [
  'delay-0',
  'delay-60',
  'delay-120',
  'delay-180',
  'delay-240',
  'delay-300',
  'delay-360',
  'delay-420',
  'delay-480',
] as const
// The chase starts once the whole row is lit; alternate bulbs run half a beat (700ms) apart.
const BULB_CHASE_CLASS = 'animate-bulb-chase [animation-delay:900ms] even:[animation-delay:1600ms]'

function bulbPositions(startX: number, endX: number): number[] {
  const spacing = (endX - startX) / (BULBS_PER_ROW - 1)
  return Array.from({ length: BULBS_PER_ROW }, (_, index) => startX + index * spacing)
}

export function MarqueeBulbs({ isLightOn }: { isLightOn: boolean }) {
  return BULB_ROWS.map((row) => (
    <g key={row.id}>
      {bulbPositions(row.startX, row.endX).map((cx, index) => {
        const powerOnDelay = isLightOn ? (BULB_POWER_ON_DELAYS[index] ?? '') : ''
        return (
          <g key={cx} className={isLightOn ? BULB_CHASE_CLASS : ''}>
            <circle cx={cx} cy={row.y} r="10" className={`fill-butter/50 ${lightClass(isLightOn)} ${powerOnDelay}`} />
            <circle
              cx={cx}
              cy={row.y}
              r="4.5"
              className={`stroke-ink transition-[fill] duration-300 ${powerOnDelay} ${isLightOn ? 'fill-butter-soft' : 'fill-ink/35'}`}
              strokeWidth="2"
            />
          </g>
        )
      })}
    </g>
  ))
}
