import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppLayout from '../AppLayout.vue'

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

describe('AppLayout', () => {
  it('renders the matched child route through RouterView', async () => {
    const router = buildRouter()
    await router.push({ name: 'dashboard' })
    await router.isReady()

    const wrapper = mount(AppLayout, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Dashboard content')
  })

  it('renders a different child route when navigation changes', async () => {
    const router = buildRouter()
    await router.push({ name: 'exercises' })
    await router.isReady()

    const wrapper = mount(AppLayout, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Exercises content')
    expect(wrapper.text()).not.toContain('Dashboard content')
  })
})
