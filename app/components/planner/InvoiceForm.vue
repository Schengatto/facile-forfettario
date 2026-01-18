<template>
  <form class="invoice-form">
    <div class="form-group">
      <h3 class="form-title">{{ t('planner.invoiceGenerator.form.companySection') }}</h3>
      <div class="form-fields">
        <div class="form-field">
          <label for="invoiceNumber">{{ t('planner.invoiceGenerator.form.invoiceNumber') }}</label>
          <input 
            type="text" 
            id="invoiceNumber" 
            v-model="modelValue.invoiceNumber"
            :placeholder="t('planner.invoiceGenerator.placeholders.invoiceNumber')"
          >
        </div>
        <div class="form-field">
          <label for="invoiceDate">{{ t('planner.invoiceGenerator.form.invoiceDate') }}</label>
          <input 
            type="date" 
            id="invoiceDate" 
            v-model="modelValue.invoiceDate"
          >
        </div>
        <div class="form-field">
          <label for="yourCompany">{{ t('planner.invoiceGenerator.form.yourCompany') }}</label>
          <input 
            type="text" 
            id="yourCompany" 
            v-model="modelValue.yourCompany"
            :placeholder="t('planner.invoiceGenerator.placeholders.yourCompany')"
          >
        </div>
        <div class="form-field">
          <label for="yourAddress">{{ t('planner.invoiceGenerator.form.yourAddress') }}</label>
          <input 
            type="text" 
            id="yourAddress" 
            v-model="modelValue.yourAddress"
            :placeholder="t('planner.invoiceGenerator.placeholders.yourAddress')"
          >
        </div>
        <div class="form-field">
          <label for="yourVAT">{{ t('planner.invoiceGenerator.form.yourVAT') }}</label>
          <input 
            type="text" 
            id="yourVAT" 
            v-model="modelValue.yourVAT"
            :placeholder="t('planner.invoiceGenerator.placeholders.yourVAT')"
          >
        </div>
      </div>
    </div>

    <div class="form-group">
      <h3 class="form-title">{{ t('planner.invoiceGenerator.form.clientSection') }}</h3>
      <div class="form-fields">
        <div class="form-field">
          <label for="clientName">{{ t('planner.invoiceGenerator.form.clientName') }}</label>
          <input 
            type="text" 
            id="clientName" 
            v-model="modelValue.clientName"
            :placeholder="t('planner.invoiceGenerator.placeholders.clientName')"
          >
        </div>
        <div class="form-field">
          <label for="clientAddress">{{ t('planner.invoiceGenerator.form.clientAddress') }}</label>
          <input 
            type="text" 
            id="clientAddress" 
            v-model="modelValue.clientAddress"
            :placeholder="t('planner.invoiceGenerator.placeholders.clientAddress')"
          >
        </div>
      </div>
    </div>

    <div class="form-group">
      <h3 class="form-title">{{ t('planner.invoiceGenerator.form.paymentSection') }}</h3>
      <div class="form-fields">
        <div class="form-field">
          <label for="paymentMethods">{{ t('planner.invoiceGenerator.form.paymentMethods') }}</label>
          <textarea 
            id="paymentMethods" 
            v-model="modelValue.paymentMethods"
            :placeholder="t('planner.invoiceGenerator.placeholders.paymentMethods')" 
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Placeholders } from './Planner';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as PropType<Placeholders>,
    required: true
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: Placeholders): void;
}>();

// Osservatore reattivo per ogni campo del form
for (const key of Object.keys(props.modelValue)) {
  computed({
    get: () => props.modelValue[key as keyof Placeholders],
    set: (value) => {
      const newValue = { ...props.modelValue, [key]: value };
      emit('update:modelValue', newValue);
    }
  });
}
</script>

<style scoped>
.invoice-form {
  padding: 1.5rem;
  background-color: var(--color-background-alt);
  border-radius: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  color: var(--color-text);
}

.form-field input,
.form-field textarea {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  color: var(--color-text);
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .invoice-form {
    padding: 1rem;
  }

  .form-fields {
    grid-template-columns: 1fr;
  }
}
</style>