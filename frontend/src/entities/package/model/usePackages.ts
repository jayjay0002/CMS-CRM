import { useQuery } from '@tanstack/react-query'

import { fetchPackages } from '../api/fetchPackages'
import { packageKeys } from './queryKeys'

export function usePackages() {
  return useQuery({
    queryKey: packageKeys.list(),
    queryFn: fetchPackages,
  })
}
