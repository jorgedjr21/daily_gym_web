import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import ExercisesPage from '../ExercisesPage.vue'
import type { ExercisesResponse } from '@/types/exercise'

vi.mock('@/services/exercises.service', () => ({
  exercisesService: {
    list: vi.fn(),
  },
}))

function buildResponse(overrides: Partial<ExercisesResponse> = {}): ExercisesResponse {
  return {
    data: [
      { id: 1, name: 'Push-ups', description: 'Chest exercise' },
      { id: 2, name: 'Pull-ups', description: 'Back exercise' },
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
      { path: '/exercises', name: 'exercises', component: ExercisesPage },
      { path: '/exercises/:id', name: 'exercise-details', component: { template: '<div />' } },
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

function mountExercisesPage() {
  return mount(ExercisesPage, { global: buildGlobalConfig(), attachTo: document.body })
}

describe('ExercisesPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders a search input', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(buildResponse())

    const wrapper = mountExercisesPage()
    await flushPromises()

    expect(wrapper.find('input[aria-label="Search exercises"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows a loading skeleton while fetching', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountExercisesPage()
    await nextTick()

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders exercise rows linking to the exercise detail page once loaded', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(buildResponse())

    const wrapper = mountExercisesPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Push-ups')
    expect(wrapper.text()).toContain('Pull-ups')

    const link = wrapper.find('a[href="/exercises/1"]')
    expect(link.exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows an empty state when there are no results', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(
      buildResponse({
        data: [],
        pagination: { page: 1, limit: 20, count: 0, pages: 0, from: 0, to: 0, prev: null, next: null },
      }),
    )

    const wrapper = mountExercisesPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/no exercises found/i)
    wrapper.unmount()
  })

  it('shows an error message when the request fails', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockRejectedValue(new Error('Network error'))

    const wrapper = mountExercisesPage()
    await flushPromises()
    await nextTick()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toMatch(/something went wrong/i)
    wrapper.unmount()
  })

  describe('search', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debounces the search input before requesting filtered results', async () => {
      const { exercisesService } = await import('@/services/exercises.service')
      vi.mocked(exercisesService.list).mockResolvedValue(buildResponse())

      const wrapper = mountExercisesPage()
      await flushPromises()
      expect(exercisesService.list).toHaveBeenCalledWith({ name: undefined, page: 1 })

      await wrapper.find('input[aria-label="Search exercises"]').setValue('push')
      await nextTick()

      vi.advanceTimersByTime(299)
      await flushPromises()
      expect(exercisesService.list).not.toHaveBeenCalledWith({ name: 'push', page: 1 })

      vi.advanceTimersByTime(1)
      await flushPromises()
      expect(exercisesService.list).toHaveBeenCalledWith({ name: 'push', page: 1 })

      wrapper.unmount()
    })
  })

  describe('pagination', () => {
    it('disables the previous button on the first page', async () => {
      const { exercisesService } = await import('@/services/exercises.service')
      vi.mocked(exercisesService.list).mockResolvedValue(
        buildResponse({
          pagination: { page: 1, limit: 20, count: 40, pages: 2, from: 1, to: 20, prev: null, next: 2 },
        }),
      )

      const wrapper = mountExercisesPage()
      await flushPromises()
      await nextTick()

      const previousButton = wrapper.find('button[aria-label="Previous page"]')
      expect((previousButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })

    it('requests the next page when the next button is clicked', async () => {
      const { exercisesService } = await import('@/services/exercises.service')
      vi.mocked(exercisesService.list).mockResolvedValue(
        buildResponse({
          pagination: { page: 1, limit: 20, count: 40, pages: 2, from: 1, to: 20, prev: null, next: 2 },
        }),
      )

      const wrapper = mountExercisesPage()
      await flushPromises()
      await nextTick()

      await wrapper.find('button[aria-label="Next page"]').trigger('click')
      await flushPromises()
      await nextTick()

      expect(exercisesService.list).toHaveBeenCalledWith({ name: undefined, page: 2 })
      wrapper.unmount()
    })

    it('disables the next button when there is no next page', async () => {
      const { exercisesService } = await import('@/services/exercises.service')
      vi.mocked(exercisesService.list).mockResolvedValue(buildResponse())

      const wrapper = mountExercisesPage()
      await flushPromises()
      await nextTick()

      const nextButton = wrapper.find('button[aria-label="Next page"]')
      expect((nextButton.element as HTMLButtonElement).disabled).toBe(true)
      wrapper.unmount()
    })
  })
})
