import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '../AppLayout.vue'

const mockMutate = vi.fn()
const isPending = ref(false)

vi.mock('@/composables/useLogoutMutation', () => ({
  useLogoutMutation: () => ({ mutate: mockMutate, isPending }),
}))

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: AppLayout,
        children: [
          {
            path: 'dashboard',
            name: 'dashboard',
            component: { template: '<div>Dashboard content</div>' },
          },
          {
            path: 'exercises',
            name: 'exercises',
            component: { template: '<div>Exercises content</div>' },
          },
        ],
      },
    ],
  })
}

async function mountAppLayout(routeName: 'dashboard' | 'exercises' = 'dashboard') {
  const router = buildRouter()
  await router.push({ name: routeName })
  await router.isReady()

  return mount(AppLayout, { global: { plugins: [router] } })
}

describe('AppLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    isPending.value = false
  })

  it('renders the matched child route through RouterView', async () => {
    const wrapper = await mountAppLayout('dashboard')
    expect(wrapper.text()).toContain('Dashboard content')
  })

  it('renders a different child route when navigation changes', async () => {
    const wrapper = await mountAppLayout('exercises')
    expect(wrapper.text()).toContain('Exercises content')
    expect(wrapper.text()).not.toContain('Dashboard content')
  })

  it('renders a logout button', async () => {
    const wrapper = await mountAppLayout()
    expect(wrapper.find('button[aria-label="Log out"]').exists()).toBe(true)
  })

  it('calls the logout mutation when the logout button is clicked', async () => {
    const wrapper = await mountAppLayout()
    await wrapper.find('button[aria-label="Log out"]').trigger('click')
    expect(mockMutate).toHaveBeenCalledOnce()
  })

  it('disables the logout button while the mutation is pending', async () => {
    isPending.value = true
    const wrapper = await mountAppLayout()
    expect(wrapper.find('button[aria-label="Log out"]').attributes('disabled')).toBeDefined()
  })

  it("displays the authenticated user's name", async () => {
    const authStore = useAuthStore()
    authStore.login('jwt-token', {
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00.000Z',
    })

    const wrapper = await mountAppLayout()
    expect(wrapper.text()).toContain('Test User')
  })
})
