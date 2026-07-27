import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'

export function useLogoutMutation() {
  const router = useRouter()
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled() {
      authStore.logout()
      queryClient.clear()
      router.push({ name: 'login' })
    },
  })
}
