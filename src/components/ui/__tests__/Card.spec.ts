import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Card from '../Card.vue'

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, { slots: { default: 'Card content' } })
    expect(wrapper.text()).toBe('Card content')
  })

  it('applies base card styles', () => {
    const wrapper = mount(Card, { slots: { default: 'Content' } })
    expect(wrapper.classes()).toContain('rounded-lg')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('bg-card')
  })
})
