import { useQuery } from '@tanstack/vue-query'
import { healthService } from '@/services/health.service'

export function useHealthCheckQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => healthService.check(),
    staleTime: 30_000,
    retry: 1,
  })
}
