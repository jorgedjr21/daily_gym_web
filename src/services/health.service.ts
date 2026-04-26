import { api } from '@/lib/api'

interface HealthCheckResponse {
  status: string
}

export const healthService = {
  check: () => api.get<HealthCheckResponse>('/health').then((r) => r.data),
}
