<template>
  <div v-if="showPage">
    <NuxtLayout>

      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPage = ref(false)

onMounted(() => {
  setTimeout(() => {
    showPage.value = true
  }, 0)
})

useHead({
  script: [
    {
      src: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
      defer: true
    }
  ]
})
</script>
