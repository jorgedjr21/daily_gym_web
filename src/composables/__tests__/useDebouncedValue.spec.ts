import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { withSetup } from '@/test/with-setup'
import { useDebouncedValue } from '../useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const source = ref('initial')
    const [debounced] = withSetup(() => useDebouncedValue(source))
    expect(debounced.value).toBe('initial')
  })

  it('does not update before the delay has passed', async () => {
    const source = ref('a')
    const [debounced] = withSetup(() => useDebouncedValue(source, 300))

    source.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(299)

    expect(debounced.value).toBe('a')
  })

  it('updates after the delay has passed', async () => {
    const source = ref('a')
    const [debounced] = withSetup(() => useDebouncedValue(source, 300))

    source.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(debounced.value).toBe('ab')
  })

  it('resets the timer on rapid successive changes', async () => {
    const source = ref('a')
    const [debounced] = withSetup(() => useDebouncedValue(source, 300))

    source.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(200)
    source.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(200)

    expect(debounced.value).toBe('a')

    vi.advanceTimersByTime(100)
    expect(debounced.value).toBe('abc')
  })
})
