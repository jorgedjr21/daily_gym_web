<script setup lang="ts">
import { ref, watch } from 'vue'
import { useExercisesQuery } from '@/composables/useExercisesQuery'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Table from '@/components/ui/Table.vue'
import TableHeader from '@/components/ui/TableHeader.vue'
import TableBody from '@/components/ui/TableBody.vue'
import TableRow from '@/components/ui/TableRow.vue'
import TableHead from '@/components/ui/TableHead.vue'
import TableCell from '@/components/ui/TableCell.vue'

const searchInput = ref('')
const search = useDebouncedValue(searchInput, 300)
const page = ref(1)

watch(search, () => {
  page.value = 1
})

const { data, isLoading, isError, refetch } = useExercisesQuery({ search, page })

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
    <div>
      <h1 class="text-2xl font-bold">Exercises</h1>
      <p class="text-sm text-muted-foreground">Browse and search the exercise catalog.</p>
    </div>

    <Input
      v-model="searchInput"
      type="search"
      placeholder="Search exercises..."
      aria-label="Search exercises"
      class="max-w-sm"
    />

    <div v-if="isLoading" role="status" aria-label="Loading exercises" class="space-y-2">
      <Skeleton v-for="n in 5" :key="n" class="h-10 w-full" />
    </div>

    <div v-else-if="isError" role="alert" class="space-y-2 text-sm text-destructive">
      <p>Something went wrong while loading exercises.</p>
      <Button variant="outline" size="sm" @click="refetch()">Try again</Button>
    </div>

    <div v-else-if="data && data.data.length === 0" class="text-sm text-muted-foreground">
      No exercises found.
    </div>

    <template v-else-if="data">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="exercise in data.data" :key="exercise.id">
            <TableCell>
              <RouterLink
                :to="{ name: 'exercise-details', params: { id: exercise.id } }"
                class="font-medium text-primary hover:underline"
              >
                {{ exercise.name }}
              </RouterLink>
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ exercise.description ?? '—' }}
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
