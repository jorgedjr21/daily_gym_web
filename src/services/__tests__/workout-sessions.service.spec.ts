import { describe, it, expect, vi } from 'vitest'
import { api } from '@/lib/api'
import { workoutSessionsService } from '../workout-sessions.service'
import type { WorkoutSessionsResponse } from '@/types/workout-session'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('workoutSessionsService', () => {
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

  it('requests the workout sessions endpoint without params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    const result = await workoutSessionsService.list()

    expect(api.get).toHaveBeenCalledWith('/api/v1/workout_sessions', { params: {} })
    expect(result).toEqual(response)
  })

  it('forwards page as a query param', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    await workoutSessionsService.list({ page: 2 })

    expect(api.get).toHaveBeenCalledWith('/api/v1/workout_sessions', {
      params: { page: 2 },
    })
  })
})
