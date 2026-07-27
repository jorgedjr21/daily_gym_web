import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { workoutSessionsService } from '@/services/workout-sessions.service'

interface UseWorkoutSessionsQueryParams {
  page: Ref<number>
  perPage?: Ref<number>
}

export function useWorkoutSessionsQuery({ page, perPage }: UseWorkoutSessionsQueryParams) {
  return useQuery(() => ({
    queryKey: ['workout-sessions', { page: page.value, perPage: perPage?.value }] as const,
    queryFn: () => workoutSessionsService.list({ page: page.value, per_page: perPage?.value }),
    placeholderData: keepPreviousData,
  }))
}
