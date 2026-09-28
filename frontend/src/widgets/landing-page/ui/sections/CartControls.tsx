import { useId } from 'react'

import { FLAVOR_COLOR_OPTIONS, type FlavorsContent } from '@/entities/site'

export type CartFlavor = FlavorsContent['items'][number]

type LightSwitchProps = {
  isOn: boolean
  onToggle: () => void
}

function LightSwitch({ isOn, onToggle }: LightSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-full font-semibold"
    >
      <span
        aria-hidden="true"
        className={`flex h-7 w-12 items-center rounded-full border-2 border-ink p-0.5 transition-colors duration-300 ${isOn ? 'bg-butter' : 'bg-ink/20'}`}
      >
        <span
          className={`size-5 rounded-full border-2 border-ink bg-kernel transition-transform duration-300 ${isOn ? 'translate-x-5' : ''}`}
        />
      </span>
      Lights
    </button>
  )
}

type FlavorPickerProps = {
  flavors: readonly CartFlavor[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

function FlavorPicker({ flavors, selectedIndex, onSelect }: FlavorPickerProps) {
  const groupName = useId()

  return (
    <fieldset>
      <legend className="sr-only">Popcorn flavor</legend>
      {/* Each label pads its swatch out to a 44px tap target. */}
      <div className="-m-1 flex flex-wrap">
        {flavors.map((flavor, index) => (
          <label key={`${index}-${flavor.name}`} title={flavor.name} className="group cursor-pointer p-1">
            <input
              type="radio"
              name={groupName}
              checked={selectedIndex === index}
              onChange={() => onSelect(index)}
              className="peer sr-only"
            />
            <span className="sr-only">{flavor.name}</span>
            <span
              aria-hidden="true"
              className={`relative block size-9 rounded-full border-2 border-ink transition-transform peer-checked:scale-110 peer-checked:outline-3 peer-checked:outline-offset-2 peer-checked:outline-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${FLAVOR_COLOR_OPTIONS[flavor.color].className}`}
            >
              {/* A check as well as the ring, so the pick doesn't hang on telling colors apart. */}
              <svg
                viewBox="0 0 12 12"
                className="absolute -top-1.5 -right-1.5 hidden size-4 rounded-full border-2 border-ink bg-kernel p-px group-has-checked:block"
              >
                <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-ink" />
              </svg>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type Props = {
  isLightOn: boolean
  onToggleLight: () => void
  flavors: readonly CartFlavor[]
  selectedFlavorIndex: number | null
  onSelectFlavor: (index: number) => void
}

// A small panel under the hero cart: switch its lights and pick the flavor it pops.
// Fixed rows (switch and flavor name on top, swatches below) so nothing shifts as the name changes.
export function CartControls({ isLightOn, onToggleLight, flavors, selectedFlavorIndex, onSelectFlavor }: Props) {
  const hasFlavors = flavors.length > 0
  const selectedName = selectedFlavorIndex === null ? null : flavors[selectedFlavorIndex]?.name

  return (
    <div className="relative mt-6 space-y-3 rounded-2xl border-2 border-ink bg-kernel px-4 py-3 shadow-sign">
      <div className="flex items-center justify-between gap-4">
        <LightSwitch isOn={isLightOn} onToggle={onToggleLight} />
        {hasFlavors && (
          <p aria-live="polite" className="min-w-0 truncate text-sm font-semibold">
            {selectedName ?? 'Pick a flavor'}
          </p>
        )}
      </div>
      {hasFlavors && (
        <FlavorPicker flavors={flavors} selectedIndex={selectedFlavorIndex} onSelect={onSelectFlavor} />
      )}
    </div>
  )
}
