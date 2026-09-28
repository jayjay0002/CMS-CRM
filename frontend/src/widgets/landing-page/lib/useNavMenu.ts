import { useEffect, useRef, useState } from 'react'

import { MEDIA_QUERIES, useMediaQuery } from '@/shared/lib'

// Open/close state for the header's small-screen menu. It closes on Esc (handing focus back to
// the toggle), on a tap outside the header, and when the screen grows wide enough for the
// inline nav, so it never stays open behind a layout that no longer shows it.
export function useNavMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const isDesktop = useMediaQuery(MEDIA_QUERIES.desktop)
  const isMenuOpen = isOpen && !isDesktop

  useEffect(() => {
    if (!isMenuOpen) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      toggleRef.current?.focus()
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  return {
    isMenuOpen,
    headerRef,
    toggleRef,
    toggleMenu: () => setIsOpen((open) => !open),
    closeMenu: () => setIsOpen(false),
  }
}
