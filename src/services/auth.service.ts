import { api } from '@/lib/api'
import type { User, LoginPayload } from '@/types/auth'

interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/users/sign_in', { user: payload }).then((r) => ({
      token: r.headers['authorization'] as string,
      user: r.data.user,
    })),
}
