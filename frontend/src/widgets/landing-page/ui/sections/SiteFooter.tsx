import type { SiteSettings } from '@/entities/site'
import { mailtoHref, telHref } from '@/shared/lib'
import { Kernel } from '@/shared/ui'

type Props = {
  settings: SiteSettings
}

export function SiteFooter({ settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink py-14 text-kernel [&_*:focus-visible]:outline-butter">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:flex-row md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Kernel className="size-9" />
            <span className="font-display text-2xl text-balance text-butter sm:text-3xl">{settings.businessName}</span>
          </div>
          <p className="mt-3 max-w-xs text-kernel/75">{settings.tagline}</p>
        </div>
        <address className="space-y-2 not-italic">
          <p>
            <a href={telHref(settings.phoneE164)} className="hover:text-butter">
              {settings.phoneDisplay}
            </a>
          </p>
          {settings.email && (
            <p>
              <a href={mailtoHref(settings.email)} className="hover:text-butter">
                {settings.email}
              </a>
            </p>
          )}
          {settings.instagramUrl && (
            <p>
              <a href={settings.instagramUrl} className="hover:text-butter">
                Instagram {settings.instagramHandle}
              </a>
            </p>
          )}
          <p className="text-kernel/75">{settings.serviceArea}</p>
        </address>
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-5 text-sm text-kernel/60 md:px-8">
        © {year} {settings.businessName}
      </p>
    </footer>
  )
}
