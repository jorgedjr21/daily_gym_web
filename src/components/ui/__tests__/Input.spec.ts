import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Input from '../Input.vue'

describe('Input', () => {
  it('renders an input element', () => {
    const wrapper = mount(Input)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('shows placeholder text', () => {
    const wrapper = mount(Input, { props: { placeholder: 'Search...' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(Input, { props: { disabled: true } })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })
})
