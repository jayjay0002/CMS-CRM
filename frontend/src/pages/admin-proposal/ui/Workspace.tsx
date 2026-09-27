import { type ReactNode, useId, useState } from 'react'

import { MEDIA_QUERIES, useMediaQuery } from '@/shared/lib'

const TABS = {
  edit: 'Edit',
  preview: 'Preview',
} as const

type Tab = keyof typeof TABS
const TAB_ORDER: readonly Tab[] = ['edit', 'preview']

const TAB = 'flex-1 rounded-full px-4 py-1.5 font-bold'

type Props = {
  bar: ReactNode
  // Scrolls on its own.
  panel: ReactNode
  // Stays visible at the bottom of the panel.
  panelFooter: ReactNode
  preview: ReactNode
  editLabel: string
}

// Fills the window: action bar on top, editor panel on the left, live preview on the right.
// Narrower screens switch between the panel and the preview with tabs.
export function Workspace({ bar, panel, panelFooter, preview, editLabel }: Props) {
  const isDesktop = useMediaQuery(MEDIA_QUERIES.wide)
  const [tab, setTab] = useState<Tab>('edit')
  const tabsId = useId()
  const showPanel = isDesktop || tab === 'edit'
  const showPreview = isDesktop || tab === 'preview'

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {bar}
      {!isDesktop && (
        <div role="tablist" aria-label="Proposal view" className="flex shrink-0 gap-1 border-b-2 border-ink/10 bg-white p-2">
          {TAB_ORDER.map((option) => (
            <button
              key={option}
              id={`${tabsId}-${option}`}
              type="button"
              role="tab"
              aria-selected={tab === option}
              aria-controls={`${tabsId}-${option}-panel`}
              onClick={() => setTab(option)}
              className={tab === option ? `${TAB} bg-ink text-kernel` : `${TAB} hover:bg-butter-soft`}
            >
              {option === 'edit' ? editLabel : TABS[option]}
            </button>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        {showPanel && (
          <div
            id={`${tabsId}-edit-panel`}
            role={isDesktop ? undefined : 'tabpanel'}
            aria-labelledby={isDesktop ? undefined : `${tabsId}-edit`}
            className="flex min-h-0 w-full flex-col border-ink/15 bg-kernel xl:w-[33rem] xl:shrink-0 xl:border-r-2"
          >
            <div className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">{panel}</div>
            <div className="shrink-0 border-t-2 border-ink/15 bg-butter-soft px-5 py-3">{panelFooter}</div>
          </div>
        )}
        {showPreview && (
          <div
            id={`${tabsId}-preview-panel`}
            role={isDesktop ? undefined : 'tabpanel'}
            aria-labelledby={isDesktop ? undefined : `${tabsId}-preview`}
            className="flex min-h-0 min-w-0 flex-1"
          >
            {preview}
          </div>
        )}
      </div>
    </div>
  )
}
