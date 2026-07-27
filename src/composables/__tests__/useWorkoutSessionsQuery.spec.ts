import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useWorkoutSessionsQuery } from '../useWorkoutSessionsQuery'

vi.mock('@/services/workout-sessions.service', () => ({
  workoutSessionsService: {
    list: vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 5, count: 0, pages: 0, from: 0, to: 0, prev: null, next: null },
    }),
  },
}))

describe('useWorkoutSessionsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', () => {
    const [result] = withSetup(() => useWorkoutSessionsQuery({ page: ref(1) }))
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('starts in loading state', () => {
    const [result] = withSetup(() => useWorkoutSessionsQuery({ page: ref(1) }))
    expect(result.isLoading.value).toBe(true)
  })

  it('forwards page and perPage to the service', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    withSetup(() => useWorkoutSessionsQuery({ page: ref(2), perPage: ref(5) }))

    expect(workoutSessionsService.list).toHaveBeenCalledWith({ page: 2, per_page: 5 })
  })

  it('omits perPage when not provided', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    withSetup(() => useWorkoutSessionsQuery({ page: ref(1) }))

    expect(workoutSessionsService.list).toHaveBeenCalledWith({ page: 1, per_page: undefined })
  })
})
