import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import type { Package } from '@/entities/package'
import { formatPrice } from '@/shared/lib'
import { errorId } from '@/shared/ui'

const FIELD_ID = 'packageSlug'

type Props = {
  packagesQuery: UseQueryResult<Package[]>
  registration: UseFormRegisterReturn
  error?: string
  contactPhone: string
}

function PickerMessage({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-ink/40 p-4 text-ink/75">{children}</p>
}

export function PackagePicker({ packagesQuery, registration, error, contactPhone }: Props) {
  const { data: packages, isPending, isError } = packagesQuery

  function renderOptions() {
    if (isPending) return <PickerMessage>Loading packages…</PickerMessage>
    if (isError) {
      return <PickerMessage>Packages didn't load. Refresh the page, or call {contactPhone}.</PickerMessage>
    }
    if (packages.length === 0) {
      return <PickerMessage>No packages are available right now. Call {contactPhone} to book.</PickerMessage>
    }
    return (
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
    )
  }

  return (
    <fieldset aria-describedby={error ? errorId(FIELD_ID) : undefined}>
      <legend className="mb-2 font-semibold">Package</legend>
      {renderOptions()}
      {error && (
        <p id={errorId(FIELD_ID)} className="mt-1.5 text-sm font-semibold text-cherry-deep">
          {error}
        </p>
      )}
    </fieldset>
  )
}
