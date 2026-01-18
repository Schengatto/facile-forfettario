<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">Pagina non trovata</h2>
      <p class="error-message">
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <div class="error-actions">
        <button @click="router.push('/')" class="btn">
          Torna alla Home
        </button>
        <button @click="router.go(-1)" class="btn-secondary">
          Torna Indietro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

useHead({
  title: 'Finance Toolbox - Pagina non trovata',
  meta: [
    { name: 'description', content: 'La pagina che stai cercando non esiste.' }
  ]
});
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.error-content {
  max-width: 600px;
  width: 100%;
}

.error-title {
  font-size: 9rem;
  font-weight: bold;
  color: var(--color-primary-background);
  line-height: 1;
  margin: 0;
}

.error-subtitle {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin: 0.5rem 0 1.5rem;
}

.error-message {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 640px) {
  .error-title {
    font-size: 6rem;
  }

  .error-subtitle {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .error-actions button {
    width: 100%;
  }
}
</style>