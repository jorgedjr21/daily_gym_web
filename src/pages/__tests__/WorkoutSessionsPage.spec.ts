import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import WorkoutSessionsPage from '../WorkoutSessionsPage.vue'
import type { WorkoutSessionsResponse } from '@/types/workout-session'

vi.mock('@/services/workout-sessions.service', () => ({
  workoutSessionsService: {
    list: vi.fn(),
  },
}))

function buildResponse(overrides: Partial<WorkoutSessionsResponse> = {}): WorkoutSessionsResponse {
  return {
    data: [
      {
        id: 1,
        name: 'Push Day',
        user_id: 1,
        workout_session_exercises: [
          { id: 1, exercise_id: 1, sets: 3, reps: 10, technique: null, current_weight: null },
          { id: 2, exercise_id: 2, sets: 4, reps: 8, technique: null, current_weight: 30 },
        ],
      },
      {
        id: 2,
        name: 'Pull Day',
        user_id: 1,
        workout_session_exercises: [
          { id: 3, exercise_id: 3, sets: 3, reps: 12, technique: null, current_weight: null },
        ],
      },
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
      { path: '/workout-sessions', name: 'workout-sessions', component: WorkoutSessionsPage },
      {
        path: '/workout-sessions/new',
        name: 'workout-session-new',
        component: { template: '<div />' },
      },
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

function mountWorkoutSessionsPage() {
  return mount(WorkoutSessionsPage, { global: buildGlobalConfig(), attachTo: document.body })
}

describe('WorkoutSessionsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders a "New session" button linking to the create form', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildResponse())

    const wrapper = mountWorkoutSessionsPage()
    await flushPromises()

    const link = wrapper.find('a[href="/workout-sessions/new"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toMatch(/new session/i)
    wrapper.unmount()
  })

  it('shows a loading skeleton while fetching', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountWorkoutSessionsPage()
    await nextTick()

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders session rows with name and exercise count once loaded', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(buildResponse())

    const wrapper = mountWorkoutSessionsPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Push Day')
    expect(wrapper.text()).toContain('Pull Day')

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('2')
    expect(rows[1]?.text()).toContain('1')
    wrapper.unmount()
  })

  it('shows an empty state with a CTA when there are no sessions', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(
      buildResponse({
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

    const wrapper = mountWorkoutSessionsPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/no workout sessions found/i)
    const links = wrapper.findAll('a[href="/workout-sessions/new"]')
    expect(links.length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('shows an error message when the request fails', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockRejectedValue(new Error('Network error'))

    const wrapper = mountWorkoutSessionsPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toMatch(/something went wrong/i)
    wrapper.unmount()
  })

  describe('pagination', () => {
    it('disables the previous button on the first page', async () => {
      const { workoutSessionsService } = await import('@/services/workout-sessions.service')
      vi.mocked(workoutSessionsService.list).mockResolvedValue(
        buildResponse({
          pagination: {
            page: 1,
            limit: 20,
            count: 40,
            pages: 2,
            from: 1,
            to: 20,
            prev: null,
            next: 2,
          },
        }),
      )

      const wrapper = mountWorkoutSessionsPage()
      await flushPromises()
      await nextTick()

      const previousButton = wrapper.find('button[aria-label="Previous page"]')
      expect((previousButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })

    it('requests the next page when the next button is clicked', async () => {
      const { workoutSessionsService } = await import('@/services/workout-sessions.service')
      vi.mocked(workoutSessionsService.list).mockResolvedValue(
        buildResponse({
          pagination: {
            page: 1,
            limit: 20,
            count: 40,
            pages: 2,
            from: 1,
            to: 20,
            prev: null,
            next: 2,
          },
        }),
      )

      const wrapper = mountWorkoutSessionsPage()
      await flushPromises()
      await nextTick()

      await wrapper.find('button[aria-label="Next page"]').trigger('click')
      await flushPromises()
      await nextTick()

      expect(workoutSessionsService.list).toHaveBeenCalledWith({ page: 2 })
      wrapper.unmount()
    })

    it('disables the next button when there is no next page', async () => {
      const { workoutSessionsService } = await import('@/services/workout-sessions.service')
      vi.mocked(workoutSessionsService.list).mockResolvedValue(buildResponse())

      const wrapper = mountWorkoutSessionsPage()
      await flushPromises()
      await nextTick()

      const nextButton = wrapper.find('button[aria-label="Next page"]')
      expect((nextButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })
  })
})
