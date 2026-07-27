import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import WorkoutPlansPage from '../WorkoutPlansPage.vue'
import type { WorkoutPlansResponse } from '@/types/workout-plan'

vi.mock('@/services/workout-plans.service', () => ({
  workoutPlansService: {
    list: vi.fn(),
  },
}))

function buildResponse(overrides: Partial<WorkoutPlansResponse> = {}): WorkoutPlansResponse {
  return {
    data: [
      {
        id: 1,
        name: 'Push Pull Legs',
        description: 'A classic split',
        user_id: 1,
        workout_sessions: [
          { id: 1, name: 'Push Day', user_id: 1, workout_session_exercises: [] },
          { id: 2, name: 'Pull Day', user_id: 1, workout_session_exercises: [] },
        ],
      },
      {
        id: 2,
        name: 'Full Body',
        description: null,
        user_id: 1,
        workout_sessions: [],
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
      { path: '/workout-plans', name: 'workout-plans', component: WorkoutPlansPage },
      {
        path: '/workout-plans/new',
        name: 'workout-plan-new',
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

function mountWorkoutPlansPage() {
  return mount(WorkoutPlansPage, { global: buildGlobalConfig(), attachTo: document.body })
}

describe('WorkoutPlansPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders a "New plan" button linking to the create form', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildResponse())

    const wrapper = mountWorkoutPlansPage()
    await flushPromises()

    const link = wrapper.find('a[href="/workout-plans/new"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toMatch(/new plan/i)
    wrapper.unmount()
  })

  it('shows a loading skeleton while fetching', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountWorkoutPlansPage()
    await nextTick()

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders plan rows with name and session count once loaded', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockResolvedValue(buildResponse())

    const wrapper = mountWorkoutPlansPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Push Pull Legs')
    expect(wrapper.text()).toContain('Full Body')

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('2')
    expect(rows[1]?.text()).toContain('0')
    wrapper.unmount()
  })

  it('shows an empty state with a CTA when there are no plans', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockResolvedValue(
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

    const wrapper = mountWorkoutPlansPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/no workout plans found/i)
    const links = wrapper.findAll('a[href="/workout-plans/new"]')
    expect(links.length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('shows an error message when the request fails', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockRejectedValue(new Error('Network error'))

    const wrapper = mountWorkoutPlansPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toMatch(/something went wrong/i)
    wrapper.unmount()
  })

  describe('pagination', () => {
    it('disables the previous button on the first page', async () => {
      const { workoutPlansService } = await import('@/services/workout-plans.service')
      vi.mocked(workoutPlansService.list).mockResolvedValue(
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

      const wrapper = mountWorkoutPlansPage()
      await flushPromises()
      await nextTick()

      const previousButton = wrapper.find('button[aria-label="Previous page"]')
      expect((previousButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })

    it('requests the next page when the next button is clicked', async () => {
      const { workoutPlansService } = await import('@/services/workout-plans.service')
      vi.mocked(workoutPlansService.list).mockResolvedValue(
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

      const wrapper = mountWorkoutPlansPage()
      await flushPromises()
      await nextTick()

      await wrapper.find('button[aria-label="Next page"]').trigger('click')
      await flushPromises()
      await nextTick()

      expect(workoutPlansService.list).toHaveBeenCalledWith({ page: 2 })
      wrapper.unmount()
    })

    it('disables the next button when there is no next page', async () => {
      const { workoutPlansService } = await import('@/services/workout-plans.service')
      vi.mocked(workoutPlansService.list).mockResolvedValue(buildResponse())

      const wrapper = mountWorkoutPlansPage()
      await flushPromises()
      await nextTick()

      const nextButton = wrapper.find('button[aria-label="Next page"]')
      expect((nextButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })
  })
})
