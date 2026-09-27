import type { ReactNode } from 'react'

import { BUSINESS } from '@/shared/config'

import { Kernel } from './Kernel'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

// Butter-yellow page with a centered sign-style card, shared by the admin sign-in screens.
export function AuthScreen({ title, subtitle, children, footer }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-butter px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Kernel className="size-10 shrink-0" />
          <span className="font-display text-2xl text-balance text-ink sm:text-3xl">{BUSINESS.name}</span>
        </div>
        <div className="rounded-3xl border-4 border-ink bg-kernel p-7 shadow-sign-lg md:p-9">
          <h1 className="font-display text-4xl text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-ink/75">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </main>
  )
}
