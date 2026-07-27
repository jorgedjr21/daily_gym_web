import { api } from '@/lib/api'
import type { WorkoutSessionsQueryParams, WorkoutSessionsResponse } from '@/types/workout-session'

export const workoutSessionsService = {
  list: (params: WorkoutSessionsQueryParams = {}) =>
    api.get<WorkoutSessionsResponse>('/api/v1/workout_sessions', { params }).then((r) => r.data),
}
