import type { WorkoutSessionExercise } from '@/types/workout-session'

export interface WorkoutPlanSession {
  id: number
  name: string
  user_id: number
  workout_session_exercises: WorkoutSessionExercise[]
}

export interface WorkoutPlan {
  id: number
  name: string
  description: string | null
  user_id: number
  workout_sessions: WorkoutPlanSession[]
}

export interface PaginationMeta {
  page: number
  limit: number
  count: number
  pages: number
  from: number
  to: number
  prev: number | null
  next: number | null
}

export interface WorkoutPlansResponse {
  data: WorkoutPlan[]
  pagination: PaginationMeta
}

export interface WorkoutPlansQueryParams {
  page?: number
  per_page?: number
}
