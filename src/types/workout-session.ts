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
  // Not returned by the API yet (WorkoutSessionBlueprint only exposes id, name,
  // user_id and workout_session_exercises). Kept optional so the UI can render
  // it once the backend starts serializing the session's creation date.
  created_at?: string
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
}
