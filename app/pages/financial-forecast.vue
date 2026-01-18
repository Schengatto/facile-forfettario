<template>
    <PersonalFinanceForecast />
</template>

<script setup lang="ts">
import PersonalFinanceForecast from '~/components/personal-finance-forecast/PersonalFinanceForecast.vue';

useHead({
  title: 'Finance Toolbox - Previsione Finanze personali',
  meta: [
    { name: 'description', content: "Scopri quando raggiungerai il tuo obiettivo patrimoniale con il nostro calcolatore di proiezione finanziaria. Simula il tuo percorso verso l'indipendenza finanziaria con diversi scenari di investimento." },
    { name: 'keywords', content: 'calcolatore patrimonio, obiettivo finanziario, indipendenza finanziaria, simulatore investimenti, proiezione finanziaria, calcolo patrimonio, pianificazione finanziaria, libertà finanziaria' },
  ],
  link: [
    { rel: 'canonical', href: 'https://finance-toolbox.it/financial-forecast' }
  ]
});
</script>