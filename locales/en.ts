export default {
    planner: {
        title: 'Revenue Planner {year}',
        confirmNewPlanner: "Are you sure you want to create a new planner? The current planner data will be lost if you haven't saved it.",
        calculateNet: "Calculate Net Income",
        confirmNetCalculation: "Warning: proceeding to calculate the net value will result in the loss of any unsaved changes in the planner. Make sure you have saved before proceeding. Do you want to continue?",
        actions: {
            save: 'Save',
            load: 'Load',
            export: 'Export',
            new: 'New',
        },
        months: {
            0: 'January',
            1: 'February',
            2: 'March',
            3: 'April',
            4: 'May',
            5: 'June',
            6: 'July',
            7: 'August',
            8: 'September',
            9: 'October',
            10: 'November',
            11: 'December'
        },
        weekDays: {
            short: {
                0: 'Sun',
                1: 'Mon',
                2: 'Tue',
                3: 'Wed',
                4: 'Thu',
                5: 'Fri',
                6: 'Sat'
            },
            long: {
                0: 'Sunday',
                1: 'Monday',
                2: 'Tuesday',
                3: 'Wednesday',
                4: 'Thursday',
                5: 'Friday',
                6: 'Saturday'
            }
        },
        summary: {
            hoursWorked: 'Hours worked this month:',
            revenue: 'Revenue this month:',
            invoiced: 'I have received payments for this month\'s invoices'
        },
        generateInvoice: 'Generate Invoice Template',
        yearOverview: 'Revenue Overview {year}',
        monthlyDetails: "Monthly Details",
        warningMessage: 'Warning: Receiving revenue over €85,000 will automatically exclude you from the flat-rate regime. To ensure you stay within the regime\'s limit, try reducing your hourly rate or the number of hours or days worked.',
        previousYearIncome: 'Previous years\' revenue received in {year}:',
        yearlyRevenue: 'Revenue {year}:',
        invoicedRevenue: 'Invoiced revenue {year}:',
        workingHours: 'Working hours',
        nonWorkingDay: 'Non-working day',
        configFileName: 'planner_config_{year}.json',
        configLoadSuccess: 'Configuration for {year} loaded successfully!',
        configLoadError: 'Error loading the file. Please make sure it\'s a valid JSON file.',
        exportHeaders: {
            date: 'Date',
            hours: 'Hours',
            revenue: 'Revenue',
            month: 'Month',
            totalHours: 'Total Hours',
            workingDays: 'Working Days'
        },
        exportSummary: {
            total: 'Total',
            workingDays: 'Working Days'
        },
        exportSummaryFileName: 'yearly_summary.csv',
        exportZipFileName: 'annual_planner_{year}.zip',
        invoiceGenerator: {
            preview: "Invoice Preview",
            downloadDocx: "Download DOCX",
            close: "Close",
            invoiceTitle: 'Invoice #{number}',
            date: 'Date',
            companyDetails: 'Company details',
            vatNumber: 'VAT Number',
            clientDetails: 'Client details',
            description: 'Description',
            hours: 'Hours',
            amount: 'Amount',
            total: 'Total',
            paymentInstructions: 'Payment instructions',
            paymentReference: 'Please use the invoice number ({number}) as a reference for the payment.',
            paymentDue: 'Payment is due within 28 days from the invoice date.',
            consultingServices: 'Professional consulting services',
            form: {
                invoiceDate: "Invoice Date",
                companySection: "Company Details",
                clientSection: "Client Details",
                paymentSection: "Payment Details",
                invoiceNumber: "Invoice Number",
                yourCompany: "Company Name",
                yourAddress: "Address",
                yourVAT: "VAT Number",
                clientName: "Client Name",
                clientAddress: "Client Address",
                paymentMethods: "Payment Methods"
            },
            placeholders: {
                invoiceNumber: 'invoice-number',
                yourCompany: 'Your Company Name',
                yourAddress: 'your address',
                yourVAT: 'your VAT Number',
                clientName: 'Client',
                clientAddress: 'client address',
                paymentMethods: 'accepted payment methods',
            },
            fileName: 'invoice_{month}_{year}.docx',
        },
        plannerConfig: {
            title: 'Annual Planner Configuration',
            loadButton: 'Load {year}',
            generateButton: '► Go to Planner',
            dailyHoursTitle: 'Working hours per day:',
            monthlyDetailsTitle: 'Monthly details for the year {year}:',
            monthlyDetailsHeaders: {
                month: 'Month',
                workDays: 'Working days',
                freeDays: 'Free days',
                estimatedRevenue: 'Estimated revenue'
            },
            total: 'Total',
            inputFields: {
                year: 'Reference year',
                hourlyRate: 'Hourly rate (€)',
                previousIncome: 'Previous year\'s revenue received'
            },
            validationErrors: {
                noWorkingDays: 'You must work at least 1 hour on one of the days of the week.',
                invalidHourlyRate: 'The hourly rate must be at least 1 euro.'
            }
        },
        plannerChart: {
            invoicedRevenue: "Invoiced Revenue {year}",
            totalRevenue: "Total Revenue {year}",
            yAxisLabel: "Revenue (€)"
        },
        holidayCountry: 'Holiday Country',
        countries: {
            italy: 'Italy',
            uk: 'United Kingdom - England'
        }
    },
}