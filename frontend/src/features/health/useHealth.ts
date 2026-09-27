import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '../../lib/api'

type Health = { status: string }

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<Health>('/health'),
  })
}
