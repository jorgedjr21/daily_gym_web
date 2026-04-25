import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function applyGuards(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isPublicOnly = to.matched.some((record) => record.meta.requiresAuth === false)

    if (requiresAuth && !authStore.isAuthenticated) {
      return { name: 'login' }
    }

    if (isPublicOnly && authStore.isAuthenticated) {
      return { name: 'dashboard' }
    }
  })

  router.afterEach((to) => {
    const title = to.meta.title
    if (typeof title === 'string') {
      document.title = `${title} | Daily Gym`
    }
  })
}
