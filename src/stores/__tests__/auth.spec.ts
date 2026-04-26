import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import type { User } from '@/types/auth'

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  created_at: '2024-01-01T00:00:00.000Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('initializes token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token')
      const store = useAuthStore()
      expect(store.token).toBe('stored-token')
    })

    it('initializes token as null when localStorage is empty', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
    })

    it('initializes user as null', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when token is null', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('returns true when token is set', () => {
      localStorage.setItem('auth_token', 'some-token')
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('stores token in memory and localStorage', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      expect(store.token).toBe('my-jwt-token')
      expect(localStorage.getItem('auth_token')).toBe('my-jwt-token')
    })

    it('stores user in memory', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      expect(store.user).toEqual(mockUser)
    })

    it('sets isAuthenticated to true', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('clears token from memory and localStorage', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      store.logout()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('clears user from memory', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      store.logout()
      expect(store.user).toBeNull()
    })

    it('sets isAuthenticated to false', () => {
      const store = useAuthStore()
      store.login('my-jwt-token', mockUser)
      store.logout()
      expect(store.isAuthenticated).toBe(false)
    })
  })
})
