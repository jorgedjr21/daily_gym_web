import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'dashboard' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false, title: 'Login' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/RegisterPage.vue'),
    meta: { requiresAuth: false, title: 'Register' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },
      {
        path: 'exercises',
        name: 'exercises',
        component: () => import('@/pages/ExercisesPage.vue'),
        meta: { requiresAuth: true, title: 'Exercises' },
      },
      {
        path: 'exercises/:id',
        name: 'exercise-details',
        component: () => import('@/pages/ExerciseDetailsPage.vue'),
        meta: { requiresAuth: true, title: 'Exercise Details' },
      },
      {
        path: 'workout-sessions',
        name: 'workout-sessions',
        component: () => import('@/pages/WorkoutSessionsPage.vue'),
        meta: { requiresAuth: true, title: 'Workout Sessions' },
      },
      {
        path: 'workout-sessions/new',
        name: 'workout-session-new',
        component: () => import('@/pages/WorkoutSessionFormPage.vue'),
        meta: { requiresAuth: true, title: 'New Workout Session' },
      },
      {
        path: 'workout-plans',
        name: 'workout-plans',
        component: () => import('@/pages/WorkoutPlansPage.vue'),
        meta: { requiresAuth: true, title: 'Workout Plans' },
      },
    ],
  },
]
