import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { useLogoutMutation } from '../useLogoutMutation'

const mockRouterPush = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({ push: mockRouterPush }),
  }
})

vi.mock('@/services/auth.service', () => ({
  authService: {
    logout: vi.fn(),
  },
}))

function withMutationSetup() {
  let result!: ReturnType<typeof useLogoutMutation>
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const clearSpy = vi.spyOn(queryClient, 'clear')

  const app = createApp({
    setup() {
      result = useLogoutMutation()
      return () => null
    },
  })

  app.use(createPinia())
  app.use(VueQueryPlugin, { queryClient })
  app.mount(document.createElement('div'))

  return { result, clearSpy }
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('calls authService.logout when triggered', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.logout).mockResolvedValueOnce(undefined)

    const { result } = withMutationSetup()
    result.mutate()
    await flushPromises()

    expect(authService.logout).toHaveBeenCalledOnce()
  })

  it('clears local session, query cache and redirects to login on success', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.logout).mockResolvedValueOnce(undefined)
    localStorage.setItem('auth_token', 'jwt-token')

    const { result, clearSpy } = withMutationSetup()
    result.mutate()
    await flushPromises()

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('still clears local session, query cache and redirects when the API call fails', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Network Error'))
    localStorage.setItem('auth_token', 'jwt-token')

    const { result, clearSpy } = withMutationSetup()
    result.mutate()
    await flushPromises()

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
  })
})
