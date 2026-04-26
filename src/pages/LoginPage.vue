<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required')
      .min(8, 'Password must have at least 8 characters'),
  }),
)

const { handleSubmit, defineField, errors } = useForm({ validationSchema: loginSchema })

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const serverError = ref<string | null>(null)

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Parameters<typeof authService.login>[0]) => authService.login(payload),
  onSuccess(data) {
    authStore.login(data.token, data.user)
    router.push({ name: 'dashboard' })
  },
  onError() {
    serverError.value = 'Invalid email or password.'
  },
})

const onSubmit = handleSubmit((values) => {
  serverError.value = null
  mutate(values)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <h1 class="text-2xl font-bold">Sign in</h1>
        <p class="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-1">
            <label class="text-sm font-medium" for="email">Email</label>
            <Input
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="you@example.com"
              :disabled="isPending"
            />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium" for="password">Password</label>
            <Input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="••••••••"
              :disabled="isPending"
            />
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>

          <p v-if="serverError" class="text-sm text-destructive">{{ serverError }}</p>

          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?
          <RouterLink :to="{ name: 'register' }" class="font-medium text-primary hover:underline">
            Sign up
          </RouterLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
