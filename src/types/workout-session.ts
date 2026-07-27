export interface WorkoutSessionExercise {
  id: number
  exercise_id: number
  sets: number
  reps: number
  technique: string | null
  current_weight: number | null
}

export interface WorkoutSession {
  id: number
  name: string
  user_id: number
  workout_session_exercises: WorkoutSessionExercise[]
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

export interface WorkoutSessionsResponse {
  data: WorkoutSession[]
  pagination: PaginationMeta
}

export interface WorkoutSessionsQueryParams {
  page?: number
  per_page?: number
}
