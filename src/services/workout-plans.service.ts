import { api } from '@/lib/api'
import type { WorkoutPlansQueryParams, WorkoutPlansResponse } from '@/types/workout-plan'

export const workoutPlansService = {
  list: (params: WorkoutPlansQueryParams = {}) =>
    api.get<WorkoutPlansResponse>('/api/v1/workout_plans', { params }).then((r) => r.data),
}
