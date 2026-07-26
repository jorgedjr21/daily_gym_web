import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  preview: {
    // Bind explicitly to the IPv4 loopback so it matches the baseURL
    // Playwright's webServer waits on (playwright.config.ts). Without this,
    // Vite resolves the "localhost" hostname via DNS, which on GitHub Actions
    // runners can resolve to the IPv6 ::1 address, leaving 127.0.0.1
    // unreachable and causing the webServer readiness check to time out.
    host: '127.0.0.1',
  },
})
