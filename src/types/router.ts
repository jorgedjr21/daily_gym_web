export type RouteName =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'exercises'
  | 'workout-sessions'
  | 'workout-plans'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}
