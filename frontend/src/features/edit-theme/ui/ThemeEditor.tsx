import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
  BODY_FONTS,
  bodyFontStack,
  DEFAULT_THEME,
  HEADING_FONTS,
  headingFontStack,
  loadGoogleFont,
  type Theme,
  THEME_COLOR_ROLE_ORDER,
  THEME_COLOR_ROLES,
} from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell, fieldAria, INPUT_CLASSES } from '@/shared/ui'

import { THEME_PRESETS, type ThemePreset } from '../config/presets'
import { contrastResults, MIN_TEXT_CONTRAST } from '../lib/contrastChecks'
import { draftTheme, isHexColor, type ThemeFormValues, themeSchema } from '../model/schema'
import { useUpdateTheme } from '../model/useUpdateTheme'

const FALLBACK_PICKER_COLOR = '#000000'
const HEX_INPUT_MAX_LENGTH = 7

function sameTheme(a: Theme, b: Theme): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

type Props = {
  theme: Theme
  // Called on every edit with the unsaved theme (drives the live preview).
  onDraftChange?: (theme: Theme) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function ThemeEditor({ theme, onDraftChange, onDirtyChange }: Props) {
  const update = useUpdateTheme()
  const form = useForm<ThemeFormValues>({ resolver: zodResolver(themeSchema), defaultValues: theme })
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = form
  const values = useWatch({ control }) as ThemeFormValues
  const toDraft = useCallback((current: ThemeFormValues) => draftTheme(current, theme), [theme])
  useDraftReporting({ form, toDraft, onDraftChange, onDirtyChange })

  // Load every offered font so the choices below can be shown in their own typeface.
  useEffect(() => {
    HEADING_FONTS.forEach((font) => loadGoogleFont(font, 'heading'))
    BODY_FONTS.forEach((font) => loadGoogleFont(font, 'body'))
  }, [])

  function apply(next: Theme) {
    const options = { shouldDirty: true, shouldValidate: true }
    setValue('colors', next.colors, options)
    setValue('headingFont', next.headingFont, options)
    setValue('bodyFont', next.bodyFont, options)
  }

  const onSubmit = handleSubmit((saved) => update.mutate(saved, { onSuccess: (result) => reset(result) }))
  const status = { isPending: update.isPending, isSuccess: update.isSuccess, error: update.error }
  const preview = draftTheme(values, theme)
  const checks = contrastResults(preview.colors)

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty} submitLabel="Save theme">
      <fieldset>
        <legend className="mb-2 font-semibold">Start from a preset</legend>
        <div className="grid gap-2 @lg:grid-cols-2">
          {THEME_PRESETS.map((preset) => (
            <PresetCard key={preset.id} preset={preset} isActive={sameTheme(preset.theme, preview)} onChoose={apply} />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Colors</legend>
        {THEME_COLOR_ROLE_ORDER.map((role) => {
          const meta = THEME_COLOR_ROLES[role]
          const id = `theme-color-${role}`
          const error = errors.colors?.[role]?.message
          return (
            <Controller
              key={role}
              control={control}
              name={`colors.${role}`}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <input
                    type="color"
                    aria-label={`${meta.label} color picker`}
                    value={isHexColor(field.value) ? field.value : FALLBACK_PICKER_COLOR}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="mt-1 size-11 shrink-0 cursor-pointer rounded-lg border-2 border-ink bg-white p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <label htmlFor={id} className="block font-semibold">
                      {meta.label}
                    </label>
                    <p className="text-sm text-ink/65">{meta.description}</p>
                    <input
                      id={id}
                      type="text"
                      spellCheck={false}
                      maxLength={HEX_INPUT_MAX_LENGTH}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      className={`${INPUT_CLASSES} mt-1 py-2 font-mono text-sm`}
                      {...fieldAria(id, error)}
                    />
                    {error && (
                      <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-cherry-deep">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
          )
        })}
      </fieldset>

      <ContrastReport checks={checks} />

      <FontChoice
        legend="Heading font"
        name="headingFont"
        fonts={HEADING_FONTS}
        stack={(font) => headingFontStack(font as (typeof HEADING_FONTS)[number])}
        control={control}
      />
      <FontChoice
        legend="Body font"
        name="bodyFont"
        fonts={BODY_FONTS}
        stack={(font) => bodyFontStack(font as (typeof BODY_FONTS)[number])}
        control={control}
      />

      <button
        type="button"
        onClick={() => apply(DEFAULT_THEME)}
        className="rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold hover:bg-butter"
      >
        Reset to default
      </button>
    </EditorShell>
  )
}

function Swatches({ theme }: { theme: Theme }) {
  return (
    <span aria-hidden="true" className="flex">
      {THEME_COLOR_ROLE_ORDER.map((role) => (
        <span
          key={role}
          className="-ml-1 size-5 rounded-full border-2 border-white first:ml-0"
          // The swatch shows a stored color, so it can't be a static class.
          style={{ backgroundColor: theme.colors[role] }}
        />
      ))}
    </span>
  )
}

type PresetCardProps = {
  preset: ThemePreset
  isActive: boolean
  onChoose: (theme: Theme) => void
}

function PresetCard({ preset, isActive, onChoose }: PresetCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onChoose(preset.theme)}
      className={`rounded-xl border-2 p-3 text-left hover:bg-butter-soft ${isActive ? 'border-ink bg-butter-soft' : 'border-ink/25 bg-white'}`}
    >
      <Swatches theme={preset.theme} />
      <span className="mt-2 block font-bold">{preset.name}</span>
      <span className="block text-sm text-ink/65">{preset.description}</span>
    </button>
  )
}

function ContrastReport({ checks }: { checks: ReturnType<typeof contrastResults> }) {
  const problems = checks.filter((check) => !check.isReadable)
  return (
    <section aria-label="Readability check" className="rounded-xl border-2 border-ink/20 bg-white p-3">
      <h3 className="font-semibold">Readability check</h3>
      {problems.length === 0 ? (
        <p className="mt-1 text-sm text-ink/70">All main text is easy to read with these colors.</p>
      ) : (
        <div role="alert" className="mt-1 space-y-1">
          <p className="text-sm text-cherry-deep">
            Some text may be hard to read. Aim for a contrast of at least {MIN_TEXT_CONTRAST}:1 so everyone,
            including people with low vision, can read it.
          </p>
          <ul className="list-disc pl-5 text-sm">
            {problems.map((check) => (
              <li key={check.where}>
                {check.where}: <strong>{check.ratio}:1</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

type FontChoiceProps = {
  legend: string
  name: 'headingFont' | 'bodyFont'
  fonts: readonly string[]
  stack: (font: string) => string
  control: ReturnType<typeof useForm<ThemeFormValues>>['control']
}

function FontChoice({ legend, name, fonts, stack, control }: FontChoiceProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <fieldset>
          <legend className="mb-1.5 font-semibold">{legend}</legend>
          <div className="grid gap-2 @lg:grid-cols-2">
            {fonts.map((font) => {
              const id = `theme-${name}-${font.replaceAll(' ', '-')}`
              return (
                <label
                  key={font}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-ink/25 bg-white px-3 py-2 has-checked:border-ink has-checked:bg-butter-soft has-focus-visible:outline-3 has-focus-visible:outline-ink"
                >
                  <input
                    id={id}
                    type="radio"
                    name={field.name}
                    value={font}
                    checked={field.value === font}
                    onChange={() => field.onChange(font)}
                    className="accent-cherry"
                  />
                  {/* Each option is shown in its own font, which is data, so it can't be a static class. */}
                  <span className="text-lg" style={{ fontFamily: stack(font) }}>
                    {font}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}
    />
  )
}
