<template>
    <header>
        <TopNavbar />
    </header>

    <div id="page">
        <main>
            <slot />
        </main>

        <footer class="disclaimer-and-copyright">
            <p class="disclaimer">Disclaimer - I dati e i calcoli forniti da questa applicazione sono aggiornati al 2025
                e hanno solo scopo informativo. Le normative fiscali possono cambiare nel tempo. Si consiglia vivamente di
                consultare un commercialista o un esperto fiscale per decisioni finanziarie accurate e aggiornate. Non
                basare
                decisioni importanti esclusivamente sui risultati di questa applicazione.</p>
            <p class="footer-actions">
                <a class="btn donate-btn" href="https://www.paypal.com/donate/?hosted_button_id=VRAH5R9B2RHJG"
                    target="_blank">Supporta questo progetto</a>
                <a class="btn report-bug-btn"
                    href="mailto:schintu.enrico@gmail.com?subject=Segnalazione%20Bug%20-%20Facile%20Forfettario"
                    target="_blank">Segnala un bug</a>
            </p>
            <p class="copyright">© 2026 <a href="https://enricoschintu.com" target="_blank"
                    rel="noopener noreferrer">Enrico
                    Schintu</a>. Tutti i diritti riservati.</p>
        </footer>
    </div>
</template>


<script setup lang="ts">
</script>

<style scoped>
#page {
    font-family: Arial, sans-serif;
    margin: 8px;
}

main {
    width: 100%;
    max-width: 1280px;
    margin: 60px auto 10px auto;
}

footer {
    width: 100%;
    max-width: 1280px;
    margin: 80px auto 10px auto;
}

.disclaimer {
    margin-top: auto;
    padding: 20px;
    border-top: 1px solid #e9ecef;
    font-size: 1.2em;
    text-align: center;
    font-weight: bold;
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    text-align: center;
}

.disclaimer p {
    margin: 0;
    line-height: 1.5;
}

.copyright {
    text-align: center;
    font-weight: bold;
}

.copyright a {
    text-decoration: none;
}

.copyright a:hover {
    text-decoration: underline;
}

.donate-btn {
    background-color: gold;
    border-radius: 1rem;
    color: #111;
}

.donate-btn:hover {
    background-color: rgb(253, 249, 14);
    color: #111;
}

.report-bug-btn {
    background-color: #cf3e34;
    border-radius: 1rem;
    color: white;
}

.report-bug-btn:hover {
    background-color: #f84b4b;
}

@media (max-width: 768px) {
    #page {
        margin-top: 100px;
    }

    main {
        max-width: 96%;
        margin: auto;
        margin-bottom: 10px;
    }
}
</style>