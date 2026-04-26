import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../routes'
import { applyGuards } from '../guards'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'

const stubUser: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test',
  role: 'user',
  created_at: '2024-01-01T00:00:00.000Z',
}

function buildRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  applyGuards(router)
  return router
}

describe('router navigation guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('redirects unauthenticated user from protected route to /login', async () => {
    const router = buildRouter()
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows unauthenticated user to access /login', async () => {
    const router = buildRouter()
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows unauthenticated user to access /register', async () => {
    const router = buildRouter()
    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('register')
  })

  it('redirects authenticated user away from /login to /dashboard', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redirects authenticated user away from /register to /dashboard', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('allows authenticated user to access /dashboard', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('allows authenticated user to access /exercises', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/exercises')
    expect(router.currentRoute.value.name).toBe('exercises')
  })

  it('allows authenticated user to access /workout-sessions', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/workout-sessions')
    expect(router.currentRoute.value.name).toBe('workout-sessions')
  })

  it('allows authenticated user to access /workout-plans', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/workout-plans')
    expect(router.currentRoute.value.name).toBe('workout-plans')
  })

  it('redirects unauthenticated user from /exercises to /login', async () => {
    const router = buildRouter()
    await router.push('/exercises')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects unauthenticated user from /workout-sessions to /login', async () => {
    const router = buildRouter()
    await router.push('/workout-sessions')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects unauthenticated user from /workout-plans to /login', async () => {
    const router = buildRouter()
    await router.push('/workout-plans')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('sets route meta title for dashboard', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/dashboard')
    expect(router.currentRoute.value.meta.title).toBe('Dashboard')
  })

  it('sets route meta title for exercises', async () => {
    const authStore = useAuthStore()
    authStore.login('test-token', stubUser)

    const router = buildRouter()
    await router.push('/exercises')
    expect(router.currentRoute.value.meta.title).toBe('Exercises')
  })
})
