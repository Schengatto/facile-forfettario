<template>
    <div class="container">
        <header>
            <h1>Finance Toolbox</h1>
            <p class="subtitle">Strumenti gratuiti per gestire le tue finanze personali</p>
        </header>

        <div>
            <section class="welcome">
                <h2>Benvenuto in Finance Toolbox</h2>
                <p>
                    Progetto creato da Enrico Schintu per mettere a disposizione di tutti, in maniera completamente
                    gratuita,
                    una serie di strumenti utili per pianificare e gestire le tue finanze personali.
                </p>

                <div v-if="!showVideo" class="video-placeholder">
                    <button @click="showVideo = true" class="show-video-btn">
                        Guarda il video di panoramica del sito
                    </button>
                </div>

            </section>

            <div v-if="showVideo" class="youtube-video-container">
                <iframe width="560" height="315"
                    src="https://www.youtube.com/embed/FvwEHtf1atc?si=w9LvpealXUQ_Isfd&autoplay=1"
                    title="YouTube video player" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>

            <section class="tools">
                <h2>Gli strumenti a tua disposizione</h2>
                <div class="tool-grid">
                    <div v-for="tool in tools" :key="tool.name" class="tool-card">
                        <h3>{{ tool.name }}</h3>
                        <p>{{ tool.description }}</p>
                        <a :href="tool.path" class="link">Scopri di più</a>
                    </div>
                </div>
            </section>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tools = ref([
    {
        name: 'Planner Annuale',
        description: 'Organizzate al meglio il vostro anno lavorativo con uno strumento intuitivo e completo.',
        path: "planner",
    },
    {
        name: 'Calcolatore Reddito Netto',
        description: 'Stimate il vostro reddito effettivo, scorporando tasse e contributi previdenziali.',
        path: "net-calculator",
    },
    // {
    //     name: 'Pianificatore di risparmi',
    //     description: 'Imposta obiettivi di risparmio e monitora i tuoi progressi.'
    // }
])

const showVideo = ref(false);

useHead({
    title: 'Finance Toolbox',
    meta: [
        { name: 'description', content: 'Finance Toolbox offre strumenti gratuiti per aiutarti a gestire le tue finanze personali. Planner annuale e calcolatore di reddito netto per professionisti e freelance.' },
        { name: 'keywords', content: 'finance, personal finance, bonds, etf, partita IVA, regime forfettario, forfettario, calcolo tasse, planner freelance, reddito netto, gestione finanziaria' },
        { property: 'og:title', content: 'Finance Toolbox - Strumenti per la gestione delle tue finanze personali' },
        { property: 'og:description', content: 'Strumenti gratuiti per gestire le tue finanze personali. Pianifica il tuo anno e calcola il reddito netto.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Finance Toolbox - Strumenti per la gestione delle tue finanze' },
        { name: 'twitter:description', content: 'Strumenti gratuiti per professionisti in regime forfettario. Pianifica e calcola il tuo reddito facilmente.' },
    ],
    link: [
        { rel: 'canonical', href: 'https://finance-toolbox.it' }
    ]
});

if (window?.localStorage) {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // Se non c'è una preferenza → opzionale, usare preferenza sistema
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}

.youtube-video-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    display: flex;
    justify-content: center;
}

.youtube-video-container::after {
    display: block;
    content: "";
    padding-top: 56.25%;
}

.youtube-video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

header {
    text-align: center;
    margin-bottom: 3rem;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1.2rem;
    font-style: italic;
}

section {
    margin-bottom: 3rem;
}

h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
}

p {
    line-height: 1.6;
}

.tool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.tool-card {
    background-color: var(--primary-50);
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tool-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #202124;
}

.link {
    color: #042a5d;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

ul {
    list-style-type: disc;
    padding-left: 1.5rem;
}

li {
    margin-bottom: 0.5rem;
}

footer {
    text-align: center;
    color: #5f6368;
    margin-top: 3rem;
}
</style>