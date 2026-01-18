export default {
    planner: {
        title: 'Planner Fatturato {year}',
        confirmNewPlanner: "Sei sicuro di voler creare un nuovo planner? I dati del planner corrente verranno persi se non li hai salvati.",
        calculateNet: "Calcola il netto",
        confirmNetCalculation: "Attenzione: procedendo per calcolare il valore netto si perderanno eventuali modifiche non salvate nel planner. Assicurati di aver salvato prima di procedere. Vuoi continuare?",
        actions: {
            save: 'Salva',
            load: 'Carica',
            export: 'Esporta',
            new: 'Nuovo',
        },
        months: {
            0: 'Gennaio',
            1: 'Febbraio',
            2: 'Marzo',
            3: 'Aprile',
            4: 'Maggio',
            5: 'Giugno',
            6: 'Luglio',
            7: 'Agosto',
            8: 'Settembre',
            9: 'Ottobre',
            10: 'Novembre',
            11: 'Dicembre'
        },
        weekDays: {
            short: {
                0: 'Dom',
                1: 'Lun',
                2: 'Mar',
                3: 'Mer',
                4: 'Gio',
                5: 'Ven',
                6: 'Sab'
            },
            long: {
                0: 'Domenica',
                1: 'Lunedì',
                2: 'Martedì',
                3: 'Mercoledì',
                4: 'Giovedì',
                5: 'Venerdì',
                6: 'Sabato'
            },
        },
        summary: {
            hoursWorked: 'Ore lavorate questo mese:',
            revenue: 'Fatturato questo mese:',
            invoiced: 'Ho incassato le fatture di questo mese'
        },
        generateInvoice: 'Genera Template Fattura',
        yearOverview: 'Panoramica Fatturato {year}',
        monthlyDetails: "Dettaglio mensile",
        warningMessage: 'Attenzione: Incassare un fatturato superiore a 85.000€ comporterà automaticamente l\'esclusione dal regime forfettario. Per esser certo di restare entro il limite del regime prova a ridurre la tua tariffa oraria o il numero di ore o giorni lavorati.',
        previousYearIncome: 'Fatturato scorsi anni incassato nel {year}:',
        yearlyRevenue: 'Fatturato {year}:',
        invoicedRevenue: 'Fatturato incassato {year}:',
        workingHours: 'Ore lavorate',
        nonWorkingDay: 'Giorno non lavorativo',
        configFileName: 'planner_config_{year}.json',
        configLoadSuccess: 'Configurazione {year} caricata con successo!',
        configLoadError: 'Errore nel caricamento del file. Assicurati che sia un file JSON valido.',
        exportHeaders: {
            date: 'Data',
            hours: 'Ore',
            revenue: 'Fatturato',
            month: 'Mese',
            totalHours: 'Ore Totali',
            workingDays: 'Giorni Lavorativi'
        },
        exportSummary: {
            total: 'Totale',
            workingDays: 'Giorni Lavorativi'
        },
        exportSummaryFileName: 'riepilogo_annuale.csv',
        exportZipFileName: 'planner_annuale_{year}.zip',
        invoiceGenerator: {
            preview: "Anteprima Fattura",
            downloadDocx: "Scarica DOCX",
            close: "Chiudi",
            invoiceTitle: 'Fattura #{number}',
            date: 'Data',
            companyDetails: 'Dettagli azienda',
            vatNumber: 'Partita IVA',
            clientDetails: 'Dettagli cliente',
            description: 'Descrizione',
            hours: 'Ore',
            amount: 'Importo',
            total: 'Totale',
            paymentInstructions: 'Istruzioni di pagamento',
            paymentReference: 'Si prega di utilizzare il numero di fattura ({number}) come riferimento per il pagamento.',
            paymentDue: 'Il pagamento è dovuto entro 28 giorni dalla data della fattura.',
            consultingServices: 'Servizi di consulenza professionale',
            form: {
                invoiceDate: "Data fattura",
                companySection: "Dati Azienda",
                clientSection: "Dati Cliente",
                paymentSection: "Dati Pagamento",
                invoiceNumber: "Numero Fattura",
                yourCompany: "Nome Azienda",
                yourAddress: "Indirizzo",
                yourVAT: "Partita IVA",
                clientName: "Nome Cliente",
                clientAddress: "Indirizzo Cliente",
                paymentMethods: "Metodi di Pagamento",
                update: "Applica valori"
            },
            placeholders: {
                invoiceNumber: 'num-fattura',
                yourCompany: 'Tua Ragione Sociale',
                yourAddress: 'tuo indirizzo',
                yourVAT: 'tua Partita IVA',
                clientName: 'Cliente',
                clientAddress: 'indirizzo cliente',
                paymentMethods: 'metodi di pagamento accettati',
            },
            fileName: 'fattura_{month}_{year}.docx',
        },
        plannerConfig: {
            title: 'Configurazione planner annuale',
            loadButton: 'Carica {year}',
            generateButton: '► Vai al Planner',
            dailyHoursTitle: 'Ore lavorate per giorno:',
            monthlyDetailsTitle: 'Dettaglio mensile per l\'anno {year}:',
            monthlyDetailsHeaders: {
                month: 'Mese',
                workDays: 'Giorni lavorati',
                freeDays: 'Giorni liberi',
                estimatedRevenue: 'Fatturato stimato'
            },
            total: 'Totale',
            inputFields: {
                year: 'Anno di riferimento',
                hourlyRate: 'Tariffa oraria (€)',
                previousIncome: 'Fatturato anno precedente incassato'
            },
            validationErrors: {
                noWorkingDays: 'Devi lavorare almeno 1 ora in uno dei giorni della settimana.',
                invalidHourlyRate: 'La tariffa oraria deve essere di almeno 1 euro.'
            }
        },
        plannerChart: {
            invoicedRevenue: "Fatturato incassato {year}",
            totalRevenue: "Fatturato {year}",
            yAxisLabel: "Fatturato (€)"
        },
        holidayCountry: 'Paese delle Festività',
        countries: {
            italy: 'Italia',
            uk: 'Regno Unito - Inghilterra'
        }
    },
}