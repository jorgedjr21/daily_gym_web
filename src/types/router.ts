export type RouteName =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'workout-sessions'
  | 'workout-plans'
  | 'workout-plan-new'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}
