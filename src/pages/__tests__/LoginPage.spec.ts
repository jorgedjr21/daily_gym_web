import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import LoginPage from '../LoginPage.vue'

const mockLogin = vi.fn()
const mockRouterPush = vi.fn()

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}))

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({ push: mockRouterPush }),
  }
})

function buildGlobalConfig() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: LoginPage },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
      { path: '/register', name: 'register', component: { template: '<div />' } },
    ],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
  }
}

function mountLoginPage() {
  return mount(LoginPage, { global: buildGlobalConfig(), attachTo: document.body })
}

type LoginWrapper = ReturnType<typeof mountLoginPage>

async function submitForm(wrapper: LoginWrapper) {
  await (wrapper.vm as unknown as { onSubmit: (e: Event) => void }).onSubmit(
    new Event('submit'),
  )
  await flushPromises()
  await nextTick()
  await flushPromises()
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    const wrapper = mountLoginPage()
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders a submit button', () => {
    const wrapper = mountLoginPage()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders a link to the register page', () => {
    const wrapper = mountLoginPage()
    const link = wrapper.find('a[href="/register"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toMatch(/sign up/i)
    wrapper.unmount()
  })

  it('shows validation error when email is empty on submit', async () => {
    const wrapper = mountLoginPage()
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/email is required/i)
    wrapper.unmount()
  })

  it('shows validation error when email format is invalid', async () => {
    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('not-an-email')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/invalid email/i)
    wrapper.unmount()
  })

  it('shows validation error when password is empty on submit', async () => {
    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('user@example.com')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/password is required/i)
    wrapper.unmount()
  })

  it('shows validation error when password is too short', async () => {
    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('input#password').setValue('short')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/at least 8 characters/i)
    wrapper.unmount()
  })

  it('calls authService.login and redirects to dashboard on success', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'jwt-token',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      },
    })

    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('input#password').setValue('password123')
    await submitForm(wrapper)

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(mockLogin).toHaveBeenCalledWith(
      'jwt-token',
      expect.objectContaining({ email: 'user@example.com' }),
    )
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'dashboard' })
    wrapper.unmount()
  })

  it('disables the submit button while loading', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.login).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('input#password').setValue('password123')

    await submitForm(wrapper)

    expect(wrapper.text()).toMatch(/signing in/i)
    wrapper.unmount()
  })

  it('shows an error message on login failure', async () => {
    const { authService } = await import('@/services/auth.service')
    const error = { response: { status: 401, data: { error: 'Invalid credentials' } } }
    vi.mocked(authService.login).mockRejectedValueOnce(error)

    const wrapper = mountLoginPage()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('input#password').setValue('wrongpassword')
    await submitForm(wrapper)
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/invalid email or password/i)
    wrapper.unmount()
  })
})
