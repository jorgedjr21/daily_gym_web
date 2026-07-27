<script setup lang="ts">
import { ref } from 'vue'
import { useWorkoutSessionsQuery } from '@/composables/useWorkoutSessionsQuery'
import { formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Table from '@/components/ui/Table.vue'
import TableHeader from '@/components/ui/TableHeader.vue'
import TableBody from '@/components/ui/TableBody.vue'
import TableRow from '@/components/ui/TableRow.vue'
import TableHead from '@/components/ui/TableHead.vue'
import TableCell from '@/components/ui/TableCell.vue'

const page = ref(1)

const { data, isLoading, isError, refetch } = useWorkoutSessionsQuery({ page })

function goToPreviousPage() {
  if (page.value > 1) {
    page.value -= 1
  }
}

function goToNextPage() {
  const next = data.value?.pagination.next
  if (next) {
    page.value = next
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Workout Sessions</h1>
        <p class="text-sm text-muted-foreground">Browse your logged workout sessions.</p>
      </div>
      <RouterLink
        :to="{ name: 'workout-session-new' }"
        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        New session
      </RouterLink>
    </div>

    <div v-if="isLoading" role="status" aria-label="Loading workout sessions" class="space-y-2">
      <Skeleton v-for="n in 5" :key="n" class="h-10 w-full" />
    </div>

    <div v-else-if="isError" role="alert" class="space-y-2 text-sm text-destructive">
      <p>Something went wrong while loading workout sessions.</p>
      <Button variant="outline" size="sm" @click="refetch()">Try again</Button>
    </div>

    <div
      v-else-if="data && data.data.length === 0"
      class="flex flex-col items-center gap-3 py-12 text-center"
    >
      <p class="text-sm text-muted-foreground">No workout sessions found.</p>
      <RouterLink
        :to="{ name: 'workout-session-new' }"
        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Create your first session
      </RouterLink>
    </div>

    <template v-else-if="data">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Exercises</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="workoutSession in data.data" :key="workoutSession.id">
            <TableCell class="font-medium">
              {{ workoutSession.name }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatDate(workoutSession.created_at) }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ workoutSession.workout_session_exercises.length }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          Page {{ data.pagination.page }} of {{ Math.max(data.pagination.pages, 1) }}
        </p>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous page"
            :disabled="!data.pagination.prev"
            @click="goToPreviousPage"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next page"
            :disabled="!data.pagination.next"
            @click="goToNextPage"
          >
            Next
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
