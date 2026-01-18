<template>
    <div class="language-selector" @mouseleave="closeMenu" @mouseenter="openMenu">
        <span @click="toggleMenu" @mouseenter="!isMobile && openMenu" class="selected-language"
            :class="{ 'active': isMenuOpen }">
            {{ currentLanguage }}
            <span class="dropdown-arrow" :class="{ 'open': isMenuOpen }">&#9662;</span>
        </span>
        <div :class="{ 'language-menu': true, 'show': isMenuOpen }">
            <div v-for="lang in availableLanguages" :key="lang.code">
                <a href="#" @click.prevent="changeLanguage(lang.code)">{{ lang.name }}</a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
    isMobile: boolean
}>();

const { locale } = useI18n();

const isMenuOpen = ref(false);

const availableLanguages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    // Add more languages as needed
];

const currentLanguage = computed(() => {
    return availableLanguages.find(lang => lang.code === locale.value)?.name || locale.value;
});

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const openMenu = () => {
    isMenuOpen.value = true;
};

const closeMenu = () => {
    isMenuOpen.value = false;
};

const changeLanguage = (langCode: string) => {
    locale.value = langCode;
    isMenuOpen.value = false;
    localStorage.setItem('userLanguage', langCode);
};
</script>

<style scoped>
.language-selector {
    position: relative;
    display: inline-block;
}

.selected-language {
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.dropdown-arrow {
    font-size: 0.8em;
    transition: transform 0.3s ease;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.language-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    border: 1px solid var(--color-secondary-background);
    z-index: 10;
    min-width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.language-menu.show {
    display: block;
}

.language-menu a {
    display: block;
    padding: 10px;
    text-decoration: none;
    color: var(--gray-900);
    white-space: nowrap;
}

.language-menu a:hover {
    color: var(--primary-900);
}

/* 
@media (max-width: 768px) {
    .language-menu {
        position: static;
        border: none;
        box-shadow: none;
    }

    .selected-language {
        border-bottom: 1px solid #555;
    }
}
*/
</style>