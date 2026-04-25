import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { applyGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

applyGuards(router)

export default router
