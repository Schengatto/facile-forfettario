<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Caricamento Configurazione</h3>

      <div class="modal-body">
        <p class="mb-4">Da dove vuoi caricare la configurazione?</p>
        <div class="button-group">
          <button @click="source = 'cloud'" :class="{ active: source === 'cloud' }" class="btn-secondary">
            Cloud
          </button>
          <button @click="source = 'file'" :class="{ active: source === 'file' }" class="btn-secondary">
            File Locale
          </button>
        </div>

        <div v-if="source === 'cloud'" class="config-input">
          <label>Inserisci il codice della configurazione:</label>
          <input v-model="configId" type="text" placeholder="Codice configurazione">
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>

        <div v-if="source === 'file'" class="config-input">
          <label>Seleziona il file di configurazione:</label>
          <input type="file" accept="application/json" @change="handleFileSelect">
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="btn-secondary">
          Annulla
        </button>
        <button @click="handleLoad" class="btn" :disabled="!canLoad">
          Carica
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'load', data: { source: 'cloud' | 'file', configId?: string, file?: File }): void;
}>();

const source = ref<'cloud' | 'file'>('cloud');
const configId = ref('');
const selectedFile = ref<File | null>(null);
const error = ref('');

const canLoad = computed(() => {
  if (source.value === 'cloud') {
    return configId.value.length > 0;
  } else {
    return selectedFile.value !== null;
  }
});

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
    error.value = '';
  }
};

const closeModal = () => {
  source.value = 'cloud';
  configId.value = '';
  selectedFile.value = null;
  error.value = '';
  emit('update:modelValue', false);
};

const handleLoad = () => {
    if (source.value === 'cloud') {
        if (!configId.value) {
            error.value = 'Inserisci un codice configurazione';
            return;
        }
        if (configId.value.length < 8) {
            error.value = 'Il codice deve essere lungo almeno 8 caratteri';
            return;
        }
        emit('load', { source: 'cloud', configId: configId.value });
    } else {
        if (!selectedFile.value) {
            error.value = 'Seleziona un file';
            return;
        }
        emit('load', { source: 'file', file: selectedFile.value });
    }
    closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: var(--gray-900);
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--gray-900);
}

.modal-body {
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.button-group button {
  flex: 1;
}

.button-group button.active {
  background-color: var(--color-primary-background);
  color: white;
}

.config-input {
  margin-top: 16px;
}

.config-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.config-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.error-message {
  color: var(--color-danger);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    padding: 16px;
  }
}
</style>