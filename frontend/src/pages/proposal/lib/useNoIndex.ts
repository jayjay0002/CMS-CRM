import { useEffect } from 'react'

// Proposal links are private: keep them out of search engines and set a clear tab title.
export function useNoIndex(title: string): void {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    const previousTitle = document.title
    document.title = title
    return () => {
      meta.remove()
      document.title = previousTitle
    }
  }, [title])
}
