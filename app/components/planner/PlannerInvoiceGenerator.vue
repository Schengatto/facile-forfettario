<template>
    <div>
        <button @click="openPreview" class="btn-secondary">
            {{ t('planner.generateInvoice') }}
        </button>

        <InvoiceModal v-if="showModal" :is-open="showModal" :selectedYear="selectedYear"
            :selected-month="months[currentMonth]" :currentMonth="currentMonth" :dailyHours="dailyHours"
            :hourlyRate="hourlyRate" :totalHoursWorked="totalHoursWorked" :totalRevenue="totalRevenue"
            :placeholders="currentPlaceholders" :t="t" @close="closeModal" @download="generateInvoiceTemplate"
            @update:placeholders="updatePlaceholders" />
    </div>
</template>

<script setup lang="ts">
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InvoiceModal from './InvoiceModal.vue';

const { t } = useI18n();
const showModal = ref(false);

const props = defineProps<{
    selectedYear: number;
    currentMonth: number;
    monthlyRevenue: Record<number, number>;
    hourlyRate: number;
    dailyHours: Record<string, number>;
    totalHoursWorked: number;
    totalRevenue: number;
    months: string[];
}>();

const currentPlaceholders = ref({
    invoiceNumber: t('planner.invoiceGenerator.placeholders.invoiceNumber'),
    yourCompany: t('planner.invoiceGenerator.placeholders.yourCompany'),
    yourAddress: t('planner.invoiceGenerator.placeholders.yourAddress'),
    yourVAT: t('planner.invoiceGenerator.placeholders.yourVAT'),
    clientName: t('planner.invoiceGenerator.placeholders.clientName'),
    clientAddress: t('planner.invoiceGenerator.placeholders.clientAddress'),
    paymentMethods: t('planner.invoiceGenerator.placeholders.paymentMethods'),
    invoiceDate: new Date().toISOString().split('T')[0],
});

const openPreview = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const updatePlaceholders = (newPlaceholders: any) => {
    currentPlaceholders.value = { ...newPlaceholders };
};

const createSafeParagraph = (text: string, options = {}) => {
    return new Paragraph({
        text: text || '',
        ...options
    });
};

const createAlignedCell = (text: string, alignment: any) => {
    return new TableCell({
        children: [new Paragraph({
            text: text || '',
            alignment: alignment,
        })],
        verticalAlign: AlignmentType.CENTER,
        margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
        }
    });
};

const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
};

const generateInvoiceTemplate = async () => {
    try {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: t('planner.invoiceGenerator.invoiceTitle', {
                                    number: currentPlaceholders.value.invoiceNumber
                                }),
                                bold: true,
                                size: 28
                            }),
                            new TextRun({
                                text: `    ${t('planner.invoiceGenerator.date')}: ${new Date(currentPlaceholders.value.invoiceDate).toLocaleDateString()}`,
                                size: 24
                            }),
                        ],
                        alignment: AlignmentType.LEFT,
                    }),
                    createSafeParagraph(''),
                    createSafeParagraph(t('planner.invoiceGenerator.companyDetails'), { bold: true }),
                    createSafeParagraph(currentPlaceholders.value.yourCompany),
                    createSafeParagraph(currentPlaceholders.value.yourAddress),
                    createSafeParagraph(`${t('planner.invoiceGenerator.vatNumber')}: ${currentPlaceholders.value.yourVAT}`),
                    createSafeParagraph(''),
                    createSafeParagraph(t('planner.invoiceGenerator.clientDetails'), { bold: true }),
                    createSafeParagraph(currentPlaceholders.value.clientName),
                    createSafeParagraph(currentPlaceholders.value.clientAddress),
                    createSafeParagraph(''),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        margins: {
                            top: 100,
                            bottom: 100,
                            left: 100,
                            right: 100
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    createAlignedCell(t('planner.invoiceGenerator.description'), AlignmentType.LEFT),
                                    createAlignedCell(t('planner.invoiceGenerator.date'), AlignmentType.RIGHT),
                                    createAlignedCell(t('planner.invoiceGenerator.hours'), AlignmentType.RIGHT),
                                    createAlignedCell(t('planner.invoiceGenerator.amount'), AlignmentType.RIGHT),
                                ],
                            }),
                            ...Object.entries(props.dailyHours)
                                .filter(([dateKey, hours]) => {
                                    const [year, month] = dateKey.split('-').map(Number);
                                    return year === props.selectedYear &&
                                        month === props.currentMonth &&
                                        hours > 0;
                                })
                                .sort(([dateKeyA], [dateKeyB]) => {
                                    const dayA = parseInt(dateKeyA.split('-')[2]);
                                    const dayB = parseInt(dateKeyB.split('-')[2]);
                                    return dayA - dayB;
                                })
                                .map(([dateKey, hours]) => {
                                    const [, , day] = dateKey.split('-');
                                    const amount = hours * props.hourlyRate;
                                    return new TableRow({
                                        children: [
                                            createAlignedCell(t('planner.invoiceGenerator.consultingServices'), AlignmentType.LEFT),
                                            createAlignedCell(`${day}/${props.currentMonth + 1}/${props.selectedYear}`, AlignmentType.RIGHT),
                                            createAlignedCell(hours.toString(), AlignmentType.RIGHT),
                                            createAlignedCell(formatCurrency(amount), AlignmentType.RIGHT),
                                        ],
                                    });
                                }),
                            new TableRow({
                                children: [
                                    createAlignedCell(t('planner.invoiceGenerator.total'), AlignmentType.LEFT),
                                    createAlignedCell('', AlignmentType.RIGHT),
                                    createAlignedCell(props.totalHoursWorked.toString(), AlignmentType.RIGHT),
                                    createAlignedCell(formatCurrency(props.totalRevenue), AlignmentType.RIGHT),
                                ],
                            }),
                        ],
                    }),
                    createSafeParagraph(''),
                    createSafeParagraph(t('planner.invoiceGenerator.paymentInstructions'), { bold: true }),
                    createSafeParagraph('_'.repeat(60)),
                    createSafeParagraph(currentPlaceholders.value.paymentMethods),
                    createSafeParagraph(t('planner.invoiceGenerator.paymentReference', {
                        number: currentPlaceholders.value.invoiceNumber
                    })),
                    createSafeParagraph(t('planner.invoiceGenerator.paymentDue')),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const fileName = t('planner.invoiceGenerator.fileName', {
            month: props.months[props.currentMonth],
            year: props.selectedYear
        });
        downloadFile(blob, fileName);

        // Chiudi il modale dopo il download
        closeModal();
    } catch (error) {
        console.error('Errore durante la generazione della fattura:', error);
    }
};
</script>