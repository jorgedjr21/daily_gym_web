import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withSetup } from '@/test/with-setup'
import { useHealthCheckQuery } from '../useHealthCheckQuery'

vi.mock('@/services/health.service', () => ({
  healthService: {
    check: vi.fn().mockResolvedValue({ status: 'ok' }),
  },
}))

describe('useHealthCheckQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes data, isLoading and isError', () => {
    const [result] = withSetup(() => useHealthCheckQuery())
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isError')
  })

  it('starts in loading state', () => {
    const [result] = withSetup(() => useHealthCheckQuery())
    expect(result.isLoading.value).toBe(true)
  })
})
