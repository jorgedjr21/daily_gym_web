export type RouteName =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'exercise-details'
  | 'workout-sessions'
  | 'workout-session-new'
  | 'workout-plans'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}
