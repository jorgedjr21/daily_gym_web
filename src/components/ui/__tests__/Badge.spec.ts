import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Badge from '../Badge.vue'

describe('Badge', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Badge, { slots: { default: '3 sessions' } })
    expect(wrapper.text()).toBe('3 sessions')
  })

  it('applies the default variant classes', () => {
    const wrapper = mount(Badge)
    expect(wrapper.classes()).toContain('bg-primary')
  })

  it('applies secondary variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'secondary' } })
    expect(wrapper.classes()).toContain('bg-secondary')
  })

  it('merges custom classes', () => {
    const wrapper = mount(Badge, { props: { class: 'uppercase' } })
    expect(wrapper.classes()).toContain('uppercase')
  })
})
