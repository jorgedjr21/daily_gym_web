import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { workoutPlansService } from '@/services/workout-plans.service'

interface UseWorkoutPlansQueryParams {
  page: Ref<number>
}

export function useWorkoutPlansQuery({ page }: UseWorkoutPlansQueryParams) {
  return useQuery(() => ({
    queryKey: ['workout-plans', { page: page.value }] as const,
    queryFn: () => workoutPlansService.list({ page: page.value }),
    placeholderData: keepPreviousData,
  }))
}
