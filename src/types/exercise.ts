export interface Exercise {
  id: number
  name: string
  description: string | null
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

export interface ExercisesResponse {
  data: Exercise[]
  pagination: PaginationMeta
}

export interface ExercisesQueryParams {
  name?: string
  page?: number
}
