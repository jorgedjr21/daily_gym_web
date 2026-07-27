import { api } from '@/lib/api'
import type { ExercisesQueryParams, ExercisesResponse } from '@/types/exercise'

export const exercisesService = {
  list: (params: ExercisesQueryParams = {}) =>
    api.get<ExercisesResponse>('/api/v1/exercises', { params }).then((r) => r.data),
}
