import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { SiteSettings } from '@/entities/site'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

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
}

export function SiteSettingsForm({ settings }: Props) {
  const updateSettings = useUpdateSiteSettings()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toFormValues(settings),
  })

  const onSubmit = handleSubmit((values) => {
    updateSettings.mutate(toSiteSettings(values), {
      onSuccess: (saved) => reset(toFormValues(saved)),
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
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

      {updateSettings.isError && <FormMessage tone="error">{saveErrorMessage(updateSettings.error)}</FormMessage>}
      {updateSettings.isSuccess && !isDirty && <FormMessage tone="success">Saved. The website is updated.</FormMessage>}

      <button type="submit" disabled={updateSettings.isPending} className={buttonClasses('primary')}>
        {updateSettings.isPending ? 'Saving…' : 'Save business info'}
      </button>
    </form>
  )
}
