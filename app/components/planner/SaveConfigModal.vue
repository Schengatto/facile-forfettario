<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Salvataggio Configurazione</h3>

      <div class="modal-body">
        <p class="mb-4">Vuoi salvare la configurazione sul cloud?</p>
        <div class="button-group">
          <button @click="wantCloudSave = true" :class="{ active: wantCloudSave }" class="btn-secondary">
            Si
          </button>
          <button @click="wantCloudSave = false" :class="{ active: !wantCloudSave }" class="btn-secondary">
            No
          </button>
        </div>

        <div v-if="wantCloudSave" class="config-input">
          <label>Inserisci un codice per il salvataggio (min. 8 caratteri):</label>
          <input v-model="configId" type="text" placeholder="Codice configurazione">
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="btn-secondary">
          Annulla
        </button>
        <button @click="handleSave" class="btn">
          Salva
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: { saveToCloud: boolean, configId?: string }): void;
}>();

const wantCloudSave = ref(false);
const configId = ref('');
const error = ref('');

const closeModal = () => {
  wantCloudSave.value = false;
  configId.value = '';
  error.value = '';
  emit('update:modelValue', false);
};

const handleSave = () => {
  if (wantCloudSave.value) {
    if (configId.value.length < 8) {
      error.value = 'Il codice deve essere lungo almeno 8 caratteri';
      return;
    }
    emit('save', { saveToCloud: true, configId: configId.value });
  } else {
    emit('save', { saveToCloud: false });
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