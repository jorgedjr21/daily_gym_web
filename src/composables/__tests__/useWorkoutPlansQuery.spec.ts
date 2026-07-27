import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useWorkoutPlansQuery } from '../useWorkoutPlansQuery'
import type { WorkoutPlansResponse } from '@/types/workout-plan'

vi.mock('@/services/workout-plans.service', () => ({
  workoutPlansService: {
    list: vi.fn(),
  },
}))

describe('useWorkoutPlansQuery', () => {
  const response: WorkoutPlansResponse = {
    data: [
      {
        id: 1,
        name: 'Push Pull Legs',
        description: null,
        user_id: 1,
        workout_sessions: [],
      },
    ],
    pagination: { page: 1, limit: 20, count: 1, pages: 1, from: 1, to: 1, prev: null, next: null },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockResolvedValue(response)

    const [result] = withSetup(() => useWorkoutPlansQuery({ page: ref(1) }))

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('calls workoutPlansService.list with the current page', async () => {
    const { workoutPlansService } = await import('@/services/workout-plans.service')
    vi.mocked(workoutPlansService.list).mockResolvedValue(response)

    withSetup(() => useWorkoutPlansQuery({ page: ref(2) }))

    await vi.waitFor(() => {
      expect(workoutPlansService.list).toHaveBeenCalledWith({ page: 2 })
    })
  })
})
