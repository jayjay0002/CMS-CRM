// Pill styles shared by the admin list filters (Bookings, Proposals).

const TAB_BASE = 'rounded-full px-4 py-1.5 font-semibold transition-colors'
const CHIP_BASE = 'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1 text-sm font-semibold transition-colors'

// The rounded frame that holds a row of tabs.
export const FILTER_TABS_FRAME = 'flex flex-wrap gap-1 rounded-full border-2 border-ink bg-white p-1'

export function filterTabClasses(isActive: boolean): string {
  return isActive ? `${TAB_BASE} bg-ink text-kernel` : `${TAB_BASE} text-ink/75 hover:bg-ink/10 hover:text-ink`
}

export function filterChipClasses(isActive: boolean): string {
  return isActive
    ? `${CHIP_BASE} border-ink bg-butter text-ink`
    : `${CHIP_BASE} border-ink/25 bg-white text-ink/80 hover:border-ink`
}

// Small secondary buttons in list states (Try again, Clear filters).
export const LIST_ACTION_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'
