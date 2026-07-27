import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useWorkoutPlansQuery } from '../useWorkoutPlansQuery'

vi.mock('@/services/workout-plans.service', () => ({
  workoutPlansService: {
    list: vi.fn().mockResolvedValue({
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
  },
}))

describe('useWorkoutPlansQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', () => {
    const [result] = withSetup(() => useWorkoutPlansQuery({ page: ref(1) }))
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('starts in loading state', () => {
    const [result] = withSetup(() => useWorkoutPlansQuery({ page: ref(1) }))
    expect(result.isLoading.value).toBe(true)
  })

  it('forwards page to the service', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    withSetup(() => useWorkoutPlansQuery({ page: ref(1) }))

    expect(workoutPlansService.list).toHaveBeenCalledWith({ page: 1 })
  })
})
