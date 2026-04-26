import axios from 'axios'

interface HealthCheckResponse {
  status: string
}

export const healthService = {
  check: () =>
    axios
      .get<HealthCheckResponse>(
        `${import.meta.env.VITE_API_URL ?? ''}/health`,
      )
      .then((r) => r.data),
}
