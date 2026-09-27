import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { SiteSettings } from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell, Field, fieldAria, INPUT_CLASSES } from '@/shared/ui'

import { type SiteSettingsFormValues, siteSettingsSchema, toFormValues, toSiteSettings } from '../model/schema'
import { useUpdateSiteSettings } from '../model/useUpdateSiteSettings'

type FieldConfig = {
  name: keyof SiteSettingsFormValues
  label: string
  type?: 'email' | 'tel' | 'url'
  placeholder?: string
}

const FIELDS: readonly FieldConfig[] = [
  { name: 'businessName', label: 'Business name' },
  { name: 'tagline', label: 'Tagline (shown in the footer)' },
  { name: 'phoneDisplay', label: 'Phone, as customers see it', type: 'tel', placeholder: '(404) 555-0147' },
  { name: 'phoneE164', label: 'Phone for tap-to-call', type: 'tel', placeholder: '+14045550147' },
  { name: 'email', label: 'Email (optional)', type: 'email' },
  { name: 'serviceArea', label: 'Service area', placeholder: 'Metro Atlanta, GA' },
  { name: 'instagramHandle', label: 'Instagram handle (optional)', placeholder: '@yourbusiness' },
  { name: 'instagramUrl', label: 'Instagram link (optional)', type: 'url', placeholder: 'https://instagram.com/…' },
]

const FIELD_ID_PREFIX = 'settings'

type Props = {
  settings: SiteSettings
  // Called on every edit with the unsaved settings (drives the live preview).
  onDraftChange?: (settings: SiteSettings) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function SiteSettingsForm({ settings, onDraftChange, onDirtyChange }: Props) {
  const updateSettings = useUpdateSiteSettings()
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toFormValues(settings),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  useDraftReporting({ form, toDraft: toSiteSettings, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => {
    updateSettings.mutate(toSiteSettings(values), {
      onSuccess: (saved) => reset(toFormValues(saved)),
    })
  })

  const status = { isPending: updateSettings.isPending, isSuccess: updateSettings.isSuccess, error: updateSettings.error }

  return (
    <EditorShell
      onSubmit={onSubmit}
      onDiscard={() => reset()}
      status={status}
      isDirty={isDirty}
      submitLabel="Save business info"
    >
      <div className="grid gap-5 @lg:grid-cols-2">
        {FIELDS.map((field) => {
          const id = `${FIELD_ID_PREFIX}-${field.name}`
          const error = errors[field.name]?.message
          return (
            <Field key={field.name} label={field.label} htmlFor={id} error={error}>
              <input
                id={id}
                type={field.type ?? 'text'}
                placeholder={field.placeholder}
                className={INPUT_CLASSES}
                {...fieldAria(id, error)}
                {...register(field.name)}
              />
            </Field>
          )
        })}
      </div>
    </EditorShell>
  )
}
