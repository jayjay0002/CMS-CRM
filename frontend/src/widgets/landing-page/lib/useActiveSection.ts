import { useEffect, useState } from 'react'

// A section counts as "current" while it crosses a thin band a little above the middle of
// the screen: where the reader's eye is, and clear of the sticky header.
const READING_BAND_MARGIN = '-40% 0px -55% 0px'

// The id of the section the reader is in, for the header nav's "you are here" state.
// One observer for all sections; the header re-renders only when the section changes.
export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  // A string, so a new array with the same ids doesn't re-create the observer.
  const idsKey = sectionIds.join(' ')

  useEffect(() => {
    const sections = idsKey
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((section) => section !== null)
    if (sections.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.find((entry) => entry.isIntersecting)
        if (entering) {
          setActiveId(entering.target.id)
          return
        }
        // Leaving the band without another section taking over (e.g. back up into the hero).
        setActiveId((current) =>
          entries.some((entry) => entry.target.id === current && !entry.isIntersecting) ? null : current,
        )
      },
      { rootMargin: READING_BAND_MARGIN },
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [idsKey])

  return activeId
}
