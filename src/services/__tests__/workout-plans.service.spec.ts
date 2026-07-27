import { describe, it, expect, vi } from 'vitest'
import { api } from '@/lib/api'
import { workoutPlansService } from '../workout-plans.service'
import type { WorkoutPlansResponse } from '@/types/workout-plan'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('workoutPlansService', () => {
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

  it('requests the workout plans endpoint without params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    const result = await workoutPlansService.list()

    expect(api.get).toHaveBeenCalledWith('/api/v1/workout_plans', { params: {} })
    expect(result).toEqual(response)
  })

  it('forwards page as a query param', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    await workoutPlansService.list({ page: 2 })

    expect(api.get).toHaveBeenCalledWith('/api/v1/workout_plans', {
      params: { page: 2 },
    })
  })
})
