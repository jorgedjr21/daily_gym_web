import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useExercisesQuery } from '../useExercisesQuery'
import type { ExercisesResponse } from '@/types/exercise'

vi.mock('@/services/exercises.service', () => ({
  exercisesService: {
    list: vi.fn(),
  },
}))

describe('useExercisesQuery', () => {
  const response: ExercisesResponse = {
    data: [{ id: 1, name: 'Push-ups', description: null }],
    pagination: { page: 1, limit: 20, count: 1, pages: 1, from: 1, to: 1, prev: null, next: null },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(response)

    const [result] = withSetup(() => useExercisesQuery({ search: ref(''), page: ref(1) }))

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('calls exercisesService.list with the name filter and page', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(response)

    withSetup(() => useExercisesQuery({ search: ref('push'), page: ref(2) }))

    await vi.waitFor(() => {
      expect(exercisesService.list).toHaveBeenCalledWith({ name: 'push', page: 2 })
    })
  })

  it('omits the name param when the search is empty', async () => {
    const { exercisesService } = await import('@/services/exercises.service')
    vi.mocked(exercisesService.list).mockResolvedValue(response)

    withSetup(() => useExercisesQuery({ search: ref(''), page: ref(1) }))

    await vi.waitFor(() => {
      expect(exercisesService.list).toHaveBeenCalledWith({ name: undefined, page: 1 })
    })
  })
})
