import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
  })

  it('renders as a button element', () => {
    const wrapper = mount(Button, { slots: { default: 'Submit' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(Button, { props: { disabled: true }, slots: { default: 'Disabled' } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('applies destructive variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'destructive' },
      slots: { default: 'Delete' },
    })
    expect(wrapper.classes()).toContain('bg-destructive')
  })
})
