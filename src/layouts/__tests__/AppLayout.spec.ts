import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '../AppLayout.vue'

const mockMutate = vi.fn()
const isPending = ref(false)

vi.mock('@/composables/useLogoutMutation', () => ({
  useLogoutMutation: () => ({ mutate: mockMutate, isPending }),
}))

describe('AppLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    isPending.value = false
  })

  it('renders the slot content', () => {
    const wrapper = mount(AppLayout, {
      slots: { default: '<div data-testid="page-content">Content</div>' },
    })
    expect(wrapper.find('[data-testid="page-content"]').exists()).toBe(true)
  })

  it('renders a logout button', () => {
    const wrapper = mount(AppLayout)
    expect(wrapper.find('button[aria-label="Log out"]').exists()).toBe(true)
  })

  it('calls the logout mutation when the logout button is clicked', async () => {
    const wrapper = mount(AppLayout)
    await wrapper.find('button[aria-label="Log out"]').trigger('click')
    expect(mockMutate).toHaveBeenCalledOnce()
  })

  it('disables the logout button while the mutation is pending', async () => {
    isPending.value = true
    const wrapper = mount(AppLayout)
    expect(wrapper.find('button[aria-label="Log out"]').attributes('disabled')).toBeDefined()
  })

  it("displays the authenticated user's name", () => {
    const authStore = useAuthStore()
    authStore.login('jwt-token', {
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00.000Z',
    })

    const wrapper = mount(AppLayout)
    expect(wrapper.text()).toContain('Test User')
  })
})
