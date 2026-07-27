import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import DashboardPage from '../DashboardPage.vue'
import type { WorkoutSessionsResponse } from '@/types/workout-session'
import type { WorkoutPlansResponse } from '@/types/workout-plan'

vi.mock('@/services/workout-sessions.service', () => ({
  workoutSessionsService: {
    list: vi.fn(),
  },
}))

vi.mock('@/services/workout-plans.service', () => ({
  workoutPlansService: {
    list: vi.fn(),
  },
}))

function buildSessionsResponse(
  overrides: Partial<WorkoutSessionsResponse> = {},
): WorkoutSessionsResponse {
  return {
    data: [
      {
        id: 1,
        name: 'Push Day',
        user_id: 1,
        workout_session_exercises: [
          { id: 1, exercise_id: 1, sets: 3, reps: 10, technique: null, current_weight: null },
        ],
      },
      {
        id: 2,
        name: 'Pull Day',
        user_id: 1,
        workout_session_exercises: [],
      },
    ],
    pagination: { page: 1, limit: 5, count: 2, pages: 1, from: 1, to: 2, prev: null, next: null },
    ...overrides,
  }
}

function buildPlansResponse(overrides: Partial<WorkoutPlansResponse> = {}): WorkoutPlansResponse {
  return {
    data: [
      { id: 1, name: 'Strength Plan', description: null, user_id: 1, workout_sessions: [] },
      { id: 2, name: 'Hypertrophy Plan', description: null, user_id: 1, workout_sessions: [] },
    ],
    pagination: { page: 1, limit: 20, count: 2, pages: 1, from: 1, to: 2, prev: null, next: null },
    ...overrides,
  }
}

function buildGlobalConfig() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/dashboard', name: 'dashboard', component: DashboardPage },
      { path: '/workout-sessions', name: 'workout-sessions', component: { template: '<div />' } },
      { path: '/workout-plans', name: 'workout-plans', component: { template: '<div />' } },
    ],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    plugins: [
      pinia,
      router,
      [VueQueryPlugin, { queryClient }] as [typeof VueQueryPlugin, { queryClient: QueryClient }],
    ],
  }
}

function mountDashboardPage() {
  return mount(DashboardPage, { global: buildGlobalConfig(), attachTo: document.body })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders quick action links for new session and new plan', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()

    expect(wrapper.text()).toMatch(/new session/i)
    expect(wrapper.text()).toMatch(/new plan/i)
    wrapper.unmount()
  })

  it('requests the 5 most recent sessions', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    mountDashboardPage()
    await flushPromises()

    expect(workoutSessionsService.list).toHaveBeenCalledWith({ page: 1, per_page: 5 })
  })

  it('shows loading skeletons for each section independently while fetching', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockImplementation(() => new Promise(() => {}))
    vi.mocked(workoutPlansService.list).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountDashboardPage()
    await nextTick()

    const statuses = wrapper.findAll('[role="status"]')
    expect(statuses.length).toBe(2)
    expect(wrapper.find('[aria-label="Loading recent sessions"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Loading plans"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders recent sessions once loaded, each linking to the sessions page', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Push Day')
    expect(wrapper.text()).toContain('Pull Day')
    const sessionLinks = wrapper.findAll('a[href="/workout-sessions"]')
    expect(sessionLinks.length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('renders plans once loaded, each linking to the plans page', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Strength Plan')
    expect(wrapper.text()).toContain('Hypertrophy Plan')
    const planLinks = wrapper.findAll('a[href="/workout-plans"]')
    expect(planLinks.length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('shows an empty state with a CTA when there are no recent sessions', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(
      buildSessionsResponse({
        data: [],
        pagination: {
          page: 1,
          limit: 5,
          count: 0,
          pages: 0,
          from: 0,
          to: 0,
          prev: null,
          next: null,
        },
      }),
    )
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/no workout sessions yet/i)
    wrapper.unmount()
  })

  it('shows an empty state with a CTA when there are no plans', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(
      buildPlansResponse({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          count: 0,
          pages: 0,
          from: 0,
          to: 0,
          prev: null,
          next: null,
        },
      }),
    )

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/no workout plans yet/i)
    wrapper.unmount()
  })

  it('shows an isolated error state for the sessions section when it fails, while plans still load', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockRejectedValue(new Error('Network error'))
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/something went wrong while loading recent sessions/i)
    expect(wrapper.text()).toContain('Strength Plan')
    wrapper.unmount()
  })

  it('shows an isolated error state for the plans section when it fails, while sessions still load', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockRejectedValue(new Error('Network error'))

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/something went wrong while loading plans/i)
    expect(wrapper.text()).toContain('Push Day')
    wrapper.unmount()
  })

  it('allows retrying a failed section', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutSessionsService.list).mockRejectedValueOnce(new Error('Network error'))
    vi.mocked(workoutSessionsService.list).mockResolvedValueOnce(buildSessionsResponse())
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildPlansResponse())

    const wrapper = mountDashboardPage()
    await flushPromises()
    await nextTick()

    const retryButton = wrapper.findAll('button').find((btn) => /try again/i.test(btn.text()))
    expect(retryButton).toBeTruthy()
    await retryButton?.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Push Day')
    wrapper.unmount()
  })
})
