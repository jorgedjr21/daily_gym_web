import { describe, it, expect, vi } from 'vitest'
import { api } from '@/lib/api'
import { exercisesService } from '../exercises.service'
import type { ExercisesResponse } from '@/types/exercise'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('exercisesService', () => {
  const response: ExercisesResponse = {
    data: [{ id: 1, name: 'Push-ups', description: null }],
    pagination: { page: 1, limit: 20, count: 1, pages: 1, from: 1, to: 1, prev: null, next: null },
  }

  it('requests the exercises endpoint without params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    const result = await exercisesService.list()

    expect(api.get).toHaveBeenCalledWith('/api/v1/exercises', { params: {} })
    expect(result).toEqual(response)
  })

  it('forwards name and page as query params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: response })

    await exercisesService.list({ name: 'push', page: 2 })

    expect(api.get).toHaveBeenCalledWith('/api/v1/exercises', {
      params: { name: 'push', page: 2 },
    })
  })
})
