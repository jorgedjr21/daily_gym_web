import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const app = createApp({
    setup() {
      result = composable()
      return () => null
    },
  })

  app.use(createPinia())
  app.use(VueQueryPlugin, { queryClient })
  app.mount(document.createElement('div'))

  return [result, app]
}
