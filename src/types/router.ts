export type RouteName =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'exercise-details'
  | 'workout-sessions'
  | 'workout-session-new'
  | 'workout-plans'
  | 'workout-plan-new'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}
