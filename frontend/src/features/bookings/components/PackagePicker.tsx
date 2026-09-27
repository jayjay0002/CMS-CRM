import type { UseFormRegisterReturn } from 'react-hook-form'

import { errorId } from '../../../components/ui/fieldStyles'
import { formatPrice } from '../../../lib/format'
import type { Package } from '../../packages/types'

const FIELD_ID = 'packageSlug'

type Props = {
  packages: readonly Package[]
  registration: UseFormRegisterReturn
  error?: string
}

export function PackagePicker({ packages, registration, error }: Props) {
  return (
    <fieldset aria-describedby={error ? errorId(FIELD_ID) : undefined}>
      <legend className="mb-2 font-semibold">Package</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {packages.map((pkg) => (
          <label
            key={pkg.slug}
            className="cursor-pointer rounded-2xl border-2 border-ink bg-white p-4 transition-[background-color,box-shadow] has-checked:bg-butter has-checked:shadow-sign has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
          >
            <input type="radio" value={pkg.slug} className="sr-only" {...registration} />
            <span className="block font-bold">{pkg.name}</span>
            <span className="mt-1 block text-sm text-ink/75">
              {formatPrice(pkg.price)}, {pkg.servings} servings
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId(FIELD_ID)} className="mt-1.5 text-sm font-semibold text-cherry-deep">
          {error}
        </p>
      )}
    </fieldset>
  )
}
