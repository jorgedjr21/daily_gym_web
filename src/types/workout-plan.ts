export interface WorkoutSessionExercise {
  id: number
  exercise_id: number
  sets: number
  reps: number
  technique: string | null
  current_weight: number | null
}

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
}
