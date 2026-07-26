import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { workoutSessionsService } from '@/services/workout-sessions.service'

interface UseWorkoutSessionsQueryParams {
  page: Ref<number>
}

export function useWorkoutSessionsQuery({ page }: UseWorkoutSessionsQueryParams) {
  return useQuery(() => ({
    queryKey: ['workout-sessions', { page: page.value }] as const,
    queryFn: () => workoutSessionsService.list({ page: page.value }),
    placeholderData: keepPreviousData,
  }))
}
