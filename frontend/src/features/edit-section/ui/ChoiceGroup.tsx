import type { UseFormRegisterReturn } from 'react-hook-form'

type Option<Value extends string> = {
  value: Value
  label: string
  description?: string
}

type Props<Value extends string> = {
  // Prefix for element ids, unique on the page.
  id: string
  legend: string
  options: readonly Option<Value>[]
  registration: UseFormRegisterReturn
}

// Radio buttons drawn as cards; the checked card is highlighted.
export function ChoiceGroup<Value extends string>({ id, legend, options, registration }: Props<Value>) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-semibold">{legend}</legend>
      <div className="grid gap-2 @lg:grid-cols-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-ink/25 bg-white p-3 has-checked:border-ink has-checked:bg-butter-soft has-focus-visible:outline-3 has-focus-visible:outline-ink"
            >
              <input id={optionId} type="radio" value={option.value} className="mt-1 accent-cherry" {...registration} />
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.description && <span className="block text-sm text-ink/65">{option.description}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
