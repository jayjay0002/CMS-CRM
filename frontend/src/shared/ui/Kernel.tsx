type ShapeProps = {
  // Fill for the puffy lobes; the popcorn cart tints these by flavor.
  bodyClassName?: string
}

// One popped kernel: puffy white lobes with a caramel outline and a buttery center.
export function KernelShape({ bodyClassName = 'fill-kernel' }: ShapeProps) {
  return (
    <>
      <g className="fill-caramel">
        <circle cx="14" cy="16" r="10.5" />
        <circle cx="26" cy="14" r="9.5" />
        <circle cx="28" cy="26" r="10.5" />
        <circle cx="15" cy="27" r="9.5" />
        <circle cx="21" cy="20" r="9.5" />
      </g>
      <g className={bodyClassName}>
        <circle cx="14" cy="16" r="9" />
        <circle cx="26" cy="14" r="8" />
        <circle cx="28" cy="26" r="9" />
        <circle cx="15" cy="27" r="8" />
        <circle cx="21" cy="20" r="8" />
      </g>
      <circle cx="21" cy="21" r="3.5" className="fill-butter" />
    </>
  )
}

type Props = {
  className?: string
}

export function Kernel({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <KernelShape />
    </svg>
  )
}
