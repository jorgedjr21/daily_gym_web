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

const registerSchema = toTypedSchema(
  z
    .object({
      name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
      email: z
        .string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Invalid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required')
        .min(8, 'Password must have at least 8 characters'),
      password_confirmation: z
        .string({ required_error: 'Password confirmation is required' })
        .min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'Passwords do not match',
      path: ['password_confirmation'],
    }),
)

const { handleSubmit, defineField, errors, setFieldError } = useForm({
  validationSchema: registerSchema,
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

const serverError = ref<string | null>(null)

interface ServerErrors {
  email?: string[]
  name?: string[]
  password?: string[]
  password_confirmation?: string[]
}

interface ApiError {
  response?: {
    status: number
    data?: { errors?: ServerErrors }
  }
}

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Parameters<typeof authService.register>[0]) =>
    authService.register(payload),
  onSuccess(data) {
    authStore.login(data.token, data.user)
    router.push({ name: 'dashboard' })
  },
  onError(error: unknown) {
    const apiError = error as ApiError
    const fieldErrors = apiError.response?.data?.errors

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const fields: (keyof ServerErrors)[] = ['name', 'email', 'password', 'password_confirmation']

      let mapped = false
      for (const field of fields) {
        const messages = fieldErrors[field]
        if (messages && messages.length > 0) {
          setFieldError(field, messages[0])
          mapped = true
        }
      }

      if (!mapped) {
        serverError.value = 'Registration failed. Please try again.'
      }
    } else {
      serverError.value = 'Registration failed. Please try again.'
    }
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
        <h1 class="text-2xl font-bold">
          Create account
        </h1>
        <p class="text-sm text-muted-foreground">
          Fill in your details to get started
        </p>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-4"
          @submit.prevent="onSubmit"
        >
          <div class="space-y-1">
            <label
              class="text-sm font-medium"
              for="name"
            >Name</label>
            <Input
              id="name"
              v-model="name"
              v-bind="nameAttrs"
              type="text"
              placeholder="John Doe"
              :disabled="isPending"
            />
            <p
              v-if="errors.name"
              class="text-sm text-destructive"
            >
              {{ errors.name }}
            </p>
          </div>

          <div class="space-y-1">
            <label
              class="text-sm font-medium"
              for="email"
            >Email</label>
            <Input
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="you@example.com"
              :disabled="isPending"
            />
            <p
              v-if="errors.email"
              class="text-sm text-destructive"
            >
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1">
            <label
              class="text-sm font-medium"
              for="password"
            >Password</label>
            <Input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="••••••••"
              :disabled="isPending"
            />
            <p
              v-if="errors.password"
              class="text-sm text-destructive"
            >
              {{ errors.password }}
            </p>
          </div>

          <div class="space-y-1">
            <label
              class="text-sm font-medium"
              for="password_confirmation"
            >Confirm password</label>
            <Input
              id="password_confirmation"
              v-model="passwordConfirmation"
              v-bind="passwordConfirmationAttrs"
              type="password"
              placeholder="••••••••"
              :disabled="isPending"
            />
            <p
              v-if="errors.password_confirmation"
              class="text-sm text-destructive"
            >
              {{ errors.password_confirmation }}
            </p>
          </div>

          <p
            v-if="serverError"
            class="text-sm text-destructive"
          >
            {{ serverError }}
          </p>

          <Button
            type="submit"
            class="w-full"
            :disabled="isPending"
          >
            {{ isPending ? 'Creating account…' : 'Create account' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?
          <RouterLink
            :to="{ name: 'login' }"
            class="font-medium text-primary hover:underline"
          >
            Sign in
          </RouterLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
