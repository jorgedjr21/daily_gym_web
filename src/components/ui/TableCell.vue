<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <td :class="cn('p-4 align-middle', props.class)">
    <slot />
  </td>
</template>
