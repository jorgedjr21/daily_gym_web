<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useLogoutMutation } from '@/composables/useLogoutMutation'
import Button from '@/components/ui/Button.vue'

const authStore = useAuthStore()
const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="mx-auto flex max-w-5xl items-center justify-between p-4">
        <span class="text-lg font-bold">Daily Gym</span>
        <div class="flex items-center gap-4">
          <span v-if="authStore.user" class="text-sm text-muted-foreground">
            {{ authStore.user.name }}
          </span>
          <Button
            variant="outline"
            size="sm"
            aria-label="Log out"
            :disabled="isLoggingOut"
            @click="logout()"
          >
            {{ isLoggingOut ? 'Logging out…' : 'Log out' }}
          </Button>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl p-4">
      <slot />
    </main>
  </div>
</template>
