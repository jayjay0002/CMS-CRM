import { BUSINESS } from '@/shared/config'
import { Kernel } from '@/shared/ui'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink py-14 text-kernel [&_*:focus-visible]:outline-butter">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:flex-row md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Kernel className="size-9" />
            <span className="font-display text-2xl text-balance text-butter sm:text-3xl">{BUSINESS.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-kernel/75">{BUSINESS.tagline}</p>
        </div>
        <address className="space-y-2 not-italic">
          <p>
            <a href={BUSINESS.phoneHref} className="hover:text-butter">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${BUSINESS.email}`} className="hover:text-butter">
              {BUSINESS.email}
            </a>
          </p>
          <p>
            <a href={BUSINESS.instagramUrl} className="hover:text-butter">
              Instagram {BUSINESS.instagramHandle}
            </a>
          </p>
          <p className="text-kernel/75">{BUSINESS.serviceArea}</p>
        </address>
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-5 text-sm text-kernel/60 md:px-8">
        © {year} {BUSINESS.name}
      </p>
    </footer>
  )
}
