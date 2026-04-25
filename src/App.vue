<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <h1 class="text-2xl font-bold">Daily Gym</h1>
        <p class="text-sm text-muted-foreground">Your personal workout tracker</p>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Input placeholder="Search exercises..." />
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </CardContent>
    </Card>
  </div>
</template>
