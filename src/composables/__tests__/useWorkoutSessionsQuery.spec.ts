import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useWorkoutSessionsQuery } from '../useWorkoutSessionsQuery'
import type { WorkoutSessionsResponse } from '@/types/workout-session'

vi.mock('@/services/workout-sessions.service', () => ({
  workoutSessionsService: {
    list: vi.fn(),
  },
}))

describe('useWorkoutSessionsQuery', () => {
  const response: WorkoutSessionsResponse = {
    data: [
      {
        id: 1,
        name: 'Push Day',
        user_id: 1,
        workout_session_exercises: [],
      },
    ],
    pagination: { page: 1, limit: 20, count: 1, pages: 1, from: 1, to: 1, prev: null, next: null },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(response)

    const [result] = withSetup(() => useWorkoutSessionsQuery({ page: ref(1) }))

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('calls workoutSessionsService.list with the current page', async () => {
    const { workoutSessionsService } = await import('@/services/workout-sessions.service')
    vi.mocked(workoutSessionsService.list).mockResolvedValue(response)

    withSetup(() => useWorkoutSessionsQuery({ page: ref(2) }))

    await vi.waitFor(() => {
      expect(workoutSessionsService.list).toHaveBeenCalledWith({ page: 2 })
    })
  })
})
