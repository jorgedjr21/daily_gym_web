import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import RegisterPage from '../RegisterPage.vue'

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
    register: vi.fn(),
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
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/register', name: 'register', component: RegisterPage },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
    ],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    plugins: [
      pinia,
      router,
      [VueQueryPlugin, { queryClient }] as [typeof VueQueryPlugin, { queryClient: QueryClient }],
    ],
  }
}

function mountRegisterPage() {
  return mount(RegisterPage, { global: buildGlobalConfig(), attachTo: document.body })
}

type RegisterWrapper = ReturnType<typeof mountRegisterPage>

async function submitForm(wrapper: RegisterWrapper) {
  await (wrapper.vm as unknown as { onSubmit: (e: Event) => void }).onSubmit(new Event('submit'))
  await flushPromises()
  await nextTick()
  await flushPromises()
}

describe('RegisterPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders name, email, password and password_confirmation fields', () => {
    const wrapper = mountRegisterPage()
    expect(wrapper.find('input#name').exists()).toBe(true)
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('input#password_confirmation').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders a submit button', () => {
    const wrapper = mountRegisterPage()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders a link to the login page', () => {
    const wrapper = mountRegisterPage()
    const link = wrapper.find('a[href="/login"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toMatch(/sign in/i)
    wrapper.unmount()
  })

  it('shows validation error when name is empty on submit', async () => {
    const wrapper = mountRegisterPage()
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/name is required/i)
    wrapper.unmount()
  })

  it('shows validation error when email is empty on submit', async () => {
    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/email is required/i)
    wrapper.unmount()
  })

  it('shows validation error when email format is invalid', async () => {
    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('not-an-email')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/invalid email/i)
    wrapper.unmount()
  })

  it('shows validation error when password is too short', async () => {
    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('short')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/at least 8 characters/i)
    wrapper.unmount()
  })

  it('shows validation error when passwords do not match', async () => {
    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#password_confirmation').setValue('different123')
    await submitForm(wrapper)
    expect(wrapper.text()).toMatch(/passwords do not match/i)
    wrapper.unmount()
  })

  it('calls authService.register and redirects to dashboard on success', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.register).mockResolvedValueOnce({
      token: 'jwt-token',
      user: {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      },
    })

    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#password_confirmation').setValue('password123')
    await submitForm(wrapper)

    expect(authService.register).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    })
    expect(mockLogin).toHaveBeenCalledWith(
      'jwt-token',
      expect.objectContaining({ email: 'john@example.com' }),
    )
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'dashboard' })
    wrapper.unmount()
  })

  it('disables the submit button while loading', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.register).mockImplementation(() => new Promise(() => {}))

    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#password_confirmation').setValue('password123')

    await submitForm(wrapper)

    expect(wrapper.text()).toMatch(/creating account/i)
    wrapper.unmount()
  })

  it('shows server error when registration fails with generic error', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.register).mockRejectedValueOnce({
      response: { status: 422, data: { errors: {} } },
    })

    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#password_confirmation').setValue('password123')
    await submitForm(wrapper)
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/registration failed/i)
    wrapper.unmount()
  })

  it('maps server email error to email field', async () => {
    const { authService } = await import('@/services/auth.service')
    vi.mocked(authService.register).mockRejectedValueOnce({
      response: {
        status: 422,
        data: { errors: { email: ['has already been taken'] } },
      },
    })

    const wrapper = mountRegisterPage()
    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#password_confirmation').setValue('password123')
    await submitForm(wrapper)
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toMatch(/has already been taken/i)
    wrapper.unmount()
  })
})
