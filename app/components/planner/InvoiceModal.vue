<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title-container">
                    <h2 class="modal-title">{{ t('planner.invoiceGenerator.preview') }} - {{ selectedMonth }} {{ selectedYear }}</h2>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" @click="handleDownload">
                        {{ t('planner.invoiceGenerator.downloadDocx') }}
                    </button>
                    <button class="btn-secondary" @click="close">
                        {{ t('planner.invoiceGenerator.close') }}
                    </button>
                </div>
            </div>

            <div class="modal-body">
                <div class="modal-layout">
                    <div class="form-container">
                        <InvoiceForm v-model="localPlaceholders" />
                    </div>

                    <div class="preview-container">
                        <InvoicePreview :selectedYear="selectedYear" :currentMonth="currentMonth"
                            :dailyHours="dailyHours" :hourlyRate="hourlyRate" :totalHoursWorked="totalHoursWorked"
                            :totalRevenue="totalRevenue" :placeholders="localPlaceholders" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import InvoicePreview from './InvoicePreview.vue';
import InvoiceForm from './InvoiceForm.vue';
import { useI18n } from 'vue-i18n';
import type { Placeholders } from './Planner';

const { t } = useI18n();

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    selectedYear: {
        type: Number,
        required: true
    },
    selectedMonth: {
        type: String,
        required: true,
    },
    currentMonth: {
        type: Number,
        required: true
    },
    dailyHours: {
        type: Object as PropType<Record<string, number>>,
        required: true
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    totalHoursWorked: {
        type: Number,
        required: true
    },
    totalRevenue: {
        type: Number,
        required: true
    },
    placeholders: {
        type: Object as PropType<Placeholders>,
        required: true
    },
});

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'download'): void;
    (e: 'update:placeholders', placeholders: Placeholders): void;
}>();

const close = () => {
    emit('close');
};

const handleDownload = () => {
    emit('download');
};

const updatePlaceholders = (newPlaceholders: Placeholders) => {
    emit('update:placeholders', newPlaceholders);
};

const disableBodyScroll = () => {
    document.body.style.overflow = 'hidden';
};

const enableBodyScroll = () => {
    document.body.style.overflow = '';
};

onMounted(() => {
    if (props.isOpen) {
        disableBodyScroll();
    }
});

onBeforeUnmount(() => {
    enableBodyScroll();
});

watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        disableBodyScroll();
    } else {
        enableBodyScroll();
    }
});

const localPlaceholders = computed<Placeholders>({
  get: () => props.placeholders,
  set: (value) => emit('update:placeholders', value)
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    overflow-y: auto;
}

.modal-content {
    background-color: var(--color-background);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background-color: var(--color-background);
    z-index: 1;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: bold;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

.modal-body {
    flex: 1;
    overflow-y: hidden;
}

.modal-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 1.5rem;
    padding: 0 1.5rem 1.5rem 1.5rem;
    height: 100%;
}

.preview-container {
    min-width: 0;
    overflow-y: auto;
}

.form-container {
    overflow: auto;
    padding-bottom: 1rem;
}

@media (max-width: 1024px) {
    .modal-layout {
        grid-template-columns: 1fr;
    }

    .form-container {
        position: static;
    }

    .modal-header {
        flex-direction: column;
        gap: 1rem;
    }

    .modal-actions {
        width: 100%;
        justify-content: stretch;
    }

    .modal-actions button {
        flex: 1;
    }
}
</style>