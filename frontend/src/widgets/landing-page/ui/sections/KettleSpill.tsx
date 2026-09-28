// A fresh batch spilling over the kettle's rim when a flavor is picked. Each kernel flies out and
// drops onto the heap (the shared `burst` keyframes read --bx/--by/--br), tinted by --popcorn-color
// like the rest of the case, so the new flavor arrives as popcorn rather than a quiet recolor.
const SPILL_KERNEL_SIZE = 26
const KETTLE_MOUTH = { x: 167, y: 150 }

const SPILL_PIECES = [
  { id: 'far-left', className: '[--bx:-88px] [--by:-8px] [--br:-160deg]' },
  { id: 'left', className: '[--bx:-56px] [--by:-24px] [--br:-80deg] [animation-delay:60ms]' },
  { id: 'up-left', className: '[--bx:-24px] [--by:-18px] [--br:120deg] [animation-delay:140ms]' },
  { id: 'up-right', className: '[--bx:28px] [--by:-20px] [--br:-120deg] [animation-delay:100ms]' },
  { id: 'right', className: '[--bx:60px] [--by:-26px] [--br:90deg] [animation-delay:30ms]' },
  { id: 'far-right', className: '[--bx:92px] [--by:-6px] [--br:200deg] [animation-delay:170ms]' },
] as const

type Props = {
  // The symbol every kernel in the case is drawn from.
  kernelHref: string
}

export function KettleSpill({ kernelHref }: Props) {
  return (
    <g aria-hidden="true">
      {/* Placed by the group, not the use's x/y: Chrome turns a use placed with x/y around the wrong
          point, which flings the kernels out of the glass. */}
      <g transform={`translate(${KETTLE_MOUTH.x} ${KETTLE_MOUTH.y})`}>
        {SPILL_PIECES.map((piece) => (
          <use
            key={piece.id}
            href={kernelHref}
            width={SPILL_KERNEL_SIZE}
            height={SPILL_KERNEL_SIZE}
            className={`origin-center animate-burst [transform-box:fill-box] ${piece.className}`}
          />
        ))}
      </g>
    </g>
  )
}
