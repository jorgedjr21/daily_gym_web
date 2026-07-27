import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { exercisesService } from '@/services/exercises.service'

interface UseExercisesQueryParams {
  search: Ref<string>
  page: Ref<number>
}

export function useExercisesQuery({ search, page }: UseExercisesQueryParams) {
  return useQuery(() => ({
    queryKey: ['exercises', { search: search.value, page: page.value }] as const,
    queryFn: () =>
      exercisesService.list({ name: search.value || undefined, page: page.value }),
    placeholderData: keepPreviousData,
  }))
}
