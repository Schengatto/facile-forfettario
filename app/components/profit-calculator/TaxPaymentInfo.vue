<template>
    <div>
        <Accordion title="📘 Guida agli acconti e saldi nel regime forfettario"
            short-text="I contribuenti in regime forfettario sono tenuti al pagamento degli acconti durante la dichiarazione dei redditi...">
            <div class="info-box">
                <p>I contribuenti in regime forfettario sono tenuti al pagamento degli acconti durante la dichiarazione
                    dei redditi. Questa guida fornisce informazioni dettagliate su scadenze, pagamenti e metodi di
                    calcolo.</p>
            </div>

            <h2>Scadenze e pagamenti</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Data</th>
                        <th>Adempimento</th>
                    </tr>
                    <tr>
                        <td>30/06/{{ currentYear }}</td>
                        <td>
                            <ul>
                                <li>Saldo {{ currentYear - 1 }}</li>
                                <li>Primo acconto {{ currentYear }}</li>
                                <li>Possibilità di rateizzazione fino a 6 rate mensili (con interessi)</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>30/11/{{ currentYear }}</td>
                        <td>
                            <ul>
                                <li>Secondo acconto {{ currentYear }}</li>
                                <li>Generalmente versato in un'unica soluzione</li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2>Meccanismo degli acconti e saldi</h2>
            <p>Ogni anno, con la dichiarazione dei redditi, si paga:</p>
            <ul>
                <li>Il saldo delle imposte dell'anno precedente (basato sulle fatture emesse e incassate)</li>
                <li>Gli acconti per l'anno in corso</li>
            </ul>
            <p>Il saldo tiene conto degli acconti già versati e può risultare a credito o a debito.</p>

            <h2>Primo anno di attività</h2>
            <div class="warning-box">
                <p>Il primo anno di attività comporta un esborso maggiore poiché:</p>
                <ul>
                    <li>Si paga l'imposta sostitutiva per intero</li>
                    <li>Si versano gli acconti per l'anno successivo</li>
                    <li>Non ci sono acconti precedenti a ridurre il saldo</li>
                </ul>
            </div>

            <h2>Metodi di calcolo degli acconti</h2>
            <h3>1. Metodo storico</h3>
            <p>Basato sul risultato dell'anno precedente.</p>
            <div class="info-box">
                <p>Esempio per un professionista in gestione separata:</p>
                <ul>
                    <li>Fatturato {{ currentYear - 1 }}: 10.000€</li>
                    <li>Imponibile (78%): 7.800€</li>
                    <li>Contributi INPS: 2.033€ (7.800€ x 26,07%)</li>
                    <li>Acconti contributi: 1.626,40€ (80% del saldo, diviso in due rate)</li>
                    <li>Imposta sostitutiva (15%) su imponibile fiscale (Imponibile - Contributi INPS): 865,05€</li>
                    <li>Acconti {{ currentYear }}: 865,05€ totali (432,52€ al 30/06 e 432,53€ al 30/11)</li>
                </ul>
            </div>

            <h3>2. Metodo previsionale</h3>
            <p>Basato sul fatturato previsto per l'anno in corso.</p>
            <div class="info-box">
                <p>Esempio con fatturato previsto di 7.500€:</p>
                <ul>
                    <li>Imponibile: 5.850€</li>
                    <li>Contributi INPS: 1.525€</li>
                    <li>Imposta sostitutiva: 648,75€</li>
                    <li>Acconti contributi: 1.220€ (80% del totale, diviso in due rate)</li>
                </ul>
            </div>

            <h2>Considerazioni finali</h2>
            <ul>
                <li>Il metodo storico è più sicuro, ideale se si prevede un fatturato simile o superiore all'anno
                    precedente.</li>
                <li>Il metodo previsionale può essere conveniente se si prevede un calo significativo del fatturato, ma
                    comporta rischi di sanzioni se la previsione è errata.</li>
                <li>È possibile utilizzare il metodo storico per il primo acconto e quello previsionale per il secondo,
                    se conveniente.</li>
                <li>In caso di errori nel metodo previsionale, è prevista una sanzione del 30% sull'imposta non versata,
                    con possibilità di ravvedimento.</li>
            </ul>
        </Accordion>
    </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.info-box {
    background-color: #f0f8ff;
    color: #2c3e50;
    border-left: 5px solid #3498db;
    padding: 10px;
    margin-bottom: 20px;
}

.warning-box {
    background-color: #fff5f5;
    color: #2c3e50;
    border-left: 5px solid #e74c3c;
    padding: 10px;
    margin-bottom: 20px;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
}

th {
    color: #2c3e50;
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}
</style>