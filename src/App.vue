<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const VueQueryDevtools = import.meta.env.DEV
  ? defineAsyncComponent(() =>
      import('@tanstack/vue-query-devtools').then((m) => m.VueQueryDevtools),
    )
  : null
</script>

<template>
  <RouterView />
  <component :is="VueQueryDevtools" v-if="VueQueryDevtools" />
</template>
