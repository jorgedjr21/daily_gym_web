import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Skeleton from '../Skeleton.vue'

describe('Skeleton', () => {
  it('renders a pulsing placeholder', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.classes()).toContain('animate-pulse')
  })

  it('merges custom classes', () => {
    const wrapper = mount(Skeleton, { props: { class: 'h-4 w-full' } })
    expect(wrapper.classes()).toContain('h-4')
    expect(wrapper.classes()).toContain('w-full')
  })
})
