import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Skeleton from '../Skeleton.vue'

describe('Skeleton', () => {
  it('applies base skeleton styles', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.classes()).toContain('animate-pulse')
    expect(wrapper.classes()).toContain('bg-muted')
  })

  it('merges custom classes', () => {
    const wrapper = mount(Skeleton, { props: { class: 'h-10 w-full' } })
    expect(wrapper.classes()).toContain('h-10')
    expect(wrapper.classes()).toContain('w-full')
  })
})
