<script setup lang="ts">
import { ref } from 'vue'
import { useWorkoutSessionsQuery } from '@/composables/useWorkoutSessionsQuery'
import { useWorkoutPlansQuery } from '@/composables/useWorkoutPlansQuery'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const RECENT_SESSIONS_LIMIT = 5

const recentSessionsPage = ref(1)
const recentSessionsPerPage = ref(RECENT_SESSIONS_LIMIT)

const {
  data: sessionsData,
  isLoading: isSessionsLoading,
  isError: isSessionsError,
  refetch: refetchSessions,
} = useWorkoutSessionsQuery({ page: recentSessionsPage, perPage: recentSessionsPerPage })

const plansPage = ref(1)

const {
  data: plansData,
  isLoading: isPlansLoading,
  isError: isPlansError,
  refetch: refetchPlans,
} = useWorkoutPlansQuery({ page: plansPage })

const quickActionLinkClasses =
  'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-sm text-muted-foreground">Your recent activity at a glance.</p>
    </div>

    <section aria-label="Quick actions" class="flex flex-wrap gap-3">
      <RouterLink :to="{ name: 'workout-sessions' }" :class="quickActionLinkClasses">
        New session
      </RouterLink>
      <RouterLink :to="{ name: 'workout-plans' }" :class="quickActionLinkClasses">
        New plan
      </RouterLink>
    </section>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 class="text-lg font-semibold">Recent sessions</h2>
          <p class="text-sm text-muted-foreground">
            Your last {{ RECENT_SESSIONS_LIMIT }} workout sessions.
          </p>
        </CardHeader>
        <CardContent>
          <div
            v-if="isSessionsLoading"
            role="status"
            aria-label="Loading recent sessions"
            class="space-y-2"
          >
            <Skeleton v-for="n in 3" :key="n" class="h-10 w-full" />
          </div>

          <div v-else-if="isSessionsError" role="alert" class="space-y-2 text-sm text-destructive">
            <p>Something went wrong while loading recent sessions.</p>
            <Button variant="outline" size="sm" @click="refetchSessions()">Try again</Button>
          </div>

          <div
            v-else-if="sessionsData && sessionsData.data.length === 0"
            class="flex flex-col items-center gap-3 py-8 text-center"
          >
            <p class="text-sm text-muted-foreground">No workout sessions yet.</p>
            <RouterLink
              :to="{ name: 'workout-sessions' }"
              class="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Create your first session
            </RouterLink>
          </div>

          <ul v-else-if="sessionsData" class="divide-y">
            <li v-for="session in sessionsData.data" :key="session.id">
              <RouterLink
                :to="{ name: 'workout-sessions' }"
                class="flex items-center justify-between py-2 text-sm hover:underline"
              >
                <span class="font-medium">{{ session.name }}</span>
                <span class="text-muted-foreground">
                  {{ session.workout_session_exercises.length }} exercises
                </span>
              </RouterLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 class="text-lg font-semibold">Plans</h2>
          <p class="text-sm text-muted-foreground">Your workout plans.</p>
        </CardHeader>
        <CardContent>
          <div v-if="isPlansLoading" role="status" aria-label="Loading plans" class="space-y-2">
            <Skeleton v-for="n in 3" :key="n" class="h-10 w-full" />
          </div>

          <div v-else-if="isPlansError" role="alert" class="space-y-2 text-sm text-destructive">
            <p>Something went wrong while loading plans.</p>
            <Button variant="outline" size="sm" @click="refetchPlans()">Try again</Button>
          </div>

          <div
            v-else-if="plansData && plansData.data.length === 0"
            class="flex flex-col items-center gap-3 py-8 text-center"
          >
            <p class="text-sm text-muted-foreground">No workout plans yet.</p>
            <RouterLink
              :to="{ name: 'workout-plans' }"
              class="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Create your first plan
            </RouterLink>
          </div>

          <ul v-else-if="plansData" class="divide-y">
            <li v-for="plan in plansData.data" :key="plan.id">
              <RouterLink
                :to="{ name: 'workout-plans' }"
                class="flex items-center justify-between py-2 text-sm hover:underline"
              >
                <span class="font-medium">{{ plan.name }}</span>
                <span class="text-muted-foreground">
                  {{ plan.workout_sessions.length }} sessions
                </span>
              </RouterLink>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
