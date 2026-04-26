import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const instance = {
    defaults: { baseURL: '' },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => instance),
    },
  }
})

describe('api client', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('creates an axios instance with the VITE_API_URL base URL', async () => {
    await import('../api')
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
      }),
    )
  })

  describe('request interceptor', () => {
    it('registers a request interceptor on the instance', async () => {
      const { api } = await import('../api')
      expect(api.interceptors.request.use).toHaveBeenCalledTimes(1)
    })

    it('injects Authorization header when token is present', async () => {
      localStorage.setItem('auth_token', 'test-jwt-token')

      const { requestInterceptor } = await import('../api')
      const config = { headers: {} as Record<string, string> }
      const result = requestInterceptor(config as Parameters<typeof requestInterceptor>[0])

      expect((result.headers as Record<string, string>)['Authorization']).toBe('test-jwt-token')
    })

    it('does not inject Authorization header when token is absent', async () => {
      const { requestInterceptor } = await import('../api')
      const config = { headers: {} as Record<string, string> }
      const result = requestInterceptor(config as Parameters<typeof requestInterceptor>[0])

      expect((result.headers as Record<string, string>)['Authorization']).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('registers a response interceptor on the instance', async () => {
      const { api } = await import('../api')
      expect(api.interceptors.response.use).toHaveBeenCalledTimes(1)
    })

    it('calls authStore.logout and redirects to /login on 401', async () => {
      const { useAuthStore } = await import('@/stores/auth')
      const store = useAuthStore()
      const logoutSpy = vi.spyOn(store, 'logout')

      const mockRouterPush = vi.fn()
      vi.doMock('@/router', () => ({ default: { push: mockRouterPush } }))

      const { responseErrorInterceptor } = await import('../api')
      const error = {
        response: { status: 401 },
        config: {},
        message: 'Unauthorized',
        isAxiosError: true,
      }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(logoutSpy).toHaveBeenCalled()
    })

    it('passes through non-401 errors without triggering logout', async () => {
      const { useAuthStore } = await import('@/stores/auth')
      const store = useAuthStore()
      const logoutSpy = vi.spyOn(store, 'logout')

      const { responseErrorInterceptor } = await import('../api')
      const error = {
        response: { status: 500 },
        config: {},
        message: 'Internal Server Error',
        isAxiosError: true,
      }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(logoutSpy).not.toHaveBeenCalled()
    })
  })
})
