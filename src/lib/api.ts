import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

export function requestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>)['Authorization'] = token
  }
  return config
}

export function responseErrorInterceptor(error: unknown): Promise<never> {
  const axiosError = error as AxiosError
  if (axiosError.response?.status === 401) {
    const authStore = useAuthStore()
    authStore.logout()
    router.push({ name: 'login' })
  }
  return Promise.reject(error)
}

api.interceptors.request.use(requestInterceptor)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  responseErrorInterceptor,
)
