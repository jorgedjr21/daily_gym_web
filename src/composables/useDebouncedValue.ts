import { ref, watch, type Ref } from 'vue'

export function useDebouncedValue<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  return debounced
}
