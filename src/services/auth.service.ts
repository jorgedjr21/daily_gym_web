import { api } from '@/lib/api'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'

interface AuthResponse {
  token: string
  user: User
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/users/sign_in', { user: payload }).then((r) => ({
      token: r.headers['authorization'] as string,
      user: r.data.user,
    })),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/users', { user: payload }).then((r) => ({
      token: r.headers['authorization'] as string,
      user: r.data.user,
    })),
}
