<template>
    <nav class="top-navbar" :class="{ 'hidden': isHidden && !isMobile }">
        <div class="nav-container">
            <div class="mobile-header" v-if="isMobile">
                <div class="menu-toggle" @click="toggleMenu" :class="{ 'open': showMenu }">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="current-page-title">{{ currentPageTitle }}</div>
            </div>
            <ul :class="{ 'nav-links': true, 'mobile': isMobile, 'show': showMenu }" @mouseleave="desktopLeaveMenu">
                <li v-for="group in menuGroups" :key="group" class="menu-group">
                    <span @click="toggleSubMenu(group)" @mouseenter="!isMobile && openSubMenu(group)"
                        class="group-title" :class="{ 'active': isSubMenuOpen(group) }">
                        {{ group }}
                    </span>
                    <div :class="{ 'sub-menu': true, 'show': isSubMenuOpen(group) }">
                        <div v-for="link in menuMap[group]" :key="link.url">
                            <RouterLink :to="link.url" @click="closeMenuAndScroll">{{ link.text }}</RouterLink>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="nav-controls">
                <LanguageSelector v-if="false" :isMobile="true" />
                <ThemeToggle />
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';

interface NavLink {
    text: string;
    url: string;
}

const router = useRouter();
const route = useRoute();
const isMobile = ref(false);
const showMenu = ref(false);
const openSubMenus = ref<Set<string>>(new Set());
const isHidden = ref(false);
const lastScrollPosition = ref(0);
const SCROLL_THRESHOLD = 50;

const menuMap = computed(() => {
    return routes.filter(r => !r.hidden).reduce((output, route) => {
        const group = route.group || 'Other';
        if (!output[group]) {
            output[group] = [];
        }
        output[group].push({ text: route.label, url: route.path });
        return output;
    }, {} as Record<string, NavLink[]>);
});

const menuGroups = computed(() => Object.keys(menuMap.value));

const currentPageTitle = computed(() => {
    const currentRoute = routes.find(r => r.path === route.path);
    return currentRoute ? currentRoute.label : '';
});

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
    if (isMobile.value) {
        openSubMenus.value = new Set(menuGroups.value);
    } else {
        openSubMenus.value.clear();
    }
};

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};

const toggleSubMenu = (group: string) => {
    if (isMobile.value) {
        if (openSubMenus.value.has(group)) {
            openSubMenus.value.delete(group);
        } else {
            openSubMenus.value.add(group);
        }
    }
};

const openSubMenu = (group: string) => {
    if (!isMobile.value) {
        openSubMenus.value.clear();
        openSubMenus.value.add(group);
    }
};

const isSubMenuOpen = (group: string) => {
    return isMobile.value || openSubMenus.value.has(group);
};

const desktopLeaveMenu = () => {
    if (!isMobile.value) {
        closeMenu();
    }
}

const closeMenu = () => {
    showMenu.value = false;
    if (!isMobile.value) {
        openSubMenus.value.clear();
    }
};

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

const closeMenuAndScroll = () => {
    closeMenu();
    router.afterEach(() => {
        setTimeout(scrollToTop, 100);
    });
};

const handleScroll = () => {
    if (isMobile.value) return;

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(currentScrollPosition - lastScrollPosition.value) < SCROLL_THRESHOLD) return;

    isHidden.value = currentScrollPosition > lastScrollPosition.value;
    lastScrollPosition.value = currentScrollPosition;
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.top-navbar {
    position: fixed;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    top: 0;
    width: 100%;
    color: var(--color-text-primary);
    padding: 0;
    margin-bottom: 1rem;
    z-index: 10;
    border-bottom: 1px solid #111;
    background-color: var(--color-background);
    transition: transform 0.3s ease-in-out;
}

.top-navbar.hidden {
    transform: translateY(-100%);
}

.nav-container {
    display: flex;
    padding: 0;
    max-width: 1280px;
    margin: auto;
    width: 1280px;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-links>li {
    position: relative;
}

.nav-links a {
    color: #111;
    text-decoration: none;
    cursor: pointer;
}

.group-title {
    color: var(--color-text-primary);
    text-decoration: none;
    cursor: pointer;
}

.group-title {
    display: block;
    padding: 10px;
}

.active {
    border-color: var(--color-primary-background);
    background-color: var(--color-primary-alt);
    color: var(--color-primary-background);
}

.top-navbar a:hover,
.top-navbar a.active {
    color: var(--primary-800);
}

.sub-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    padding: 1em;
    color: #111;
    background-color: #fff;
    min-width: 150px;
    z-index: 10;
    border: 1px solid var(--color-secondary-background);
    flex-direction: column;
    gap: 12px;
}

.sub-menu.show {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    white-space: nowrap;
}

.menu-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
    margin-left: 0.5rem;
    width: 30px;
    height: 25px;
    position: relative;
    transform: rotate(0deg);
    transition: .5s ease-in-out;
}

.menu-toggle span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: var(--color-text-primary);
    border-radius: 9px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
}

.menu-toggle span:nth-child(1) {
    top: 0px;
}

.menu-toggle span:nth-child(2) {
    top: 10px;
}

.menu-toggle span:nth-child(3) {
    top: 20px;
}

.menu-toggle.open span:nth-child(1) {
    top: 10px;
    transform: rotate(135deg);
}

.menu-toggle.open span:nth-child(2) {
    opacity: 0;
    left: -60px;
}

.menu-toggle.open span:nth-child(3) {
    top: 10px;
    transform: rotate(-135deg);
}

.mobile-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5rem;
}

.current-page-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-text-primary);
}

a {
    font-style: normal;
}

.nav-links>li:last-child {
    margin-left: auto;
    /* This will push the language selector to the right */
}

@media (max-width: 768px) {
    .top-navbar {
        padding: 0;
        border: none;
        background-color: var(--color-background);
    }

    .nav-container {
        flex-direction: column;
        align-items: flex-start;
        margin: 0;
        width: 100%;
        max-width: 100%;
    }

    .mobile-header {
        display: flex;
        justify-content: start;
        gap: 20px;
        align-items: center;
        width: 100%;
        padding: 0.5rem;
        /* background-color: #fff; */
    }

    .nav-links {
        display: none;
        left: 0;
        flex-direction: column;
        width: 100%;
        position: absolute;
        top: 54px;
        background-color: #fff;
        height: calc(100vh - 60px);
    }

    .nav-links.show {
        display: flex;
        flex-direction: column;
    }

    .nav-links>li {
        margin: 0;
        width: 100%;
    }

    .menu-toggle {
        display: flex;
        margin-top: 10px;
        background-color: transparent;
        padding: 0.25rem;
        color: var(--gray-900);
    }

    .bg-white {
        background-color: #fff;
    }

    .sub-menu {
        position: static;
        background-color: #fff;
        display: block;
        font-size: 14pt;
    }

    .sub-menu div {
        padding: 1rem 0;
    }

    .group-title {
        color: #111;
        border-bottom: 1px solid #555;
        font-size: 14pt;
    }

    .group-title:hover {
        cursor: default;
    }

    .active {
        border-color: var(--color-text-primary);
        background-color: var(--color-secondary-background);
        color: var(--color-secondary-text);
    }

    .sub-menu {
        border: none;
    }

    .nav-links>li:last-child {
        margin-left: 0;
        /* Reset margin for mobile view */
    }

    .auth-menu-item {
        margin-left: auto;
    }
}

.auth-menu-item {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
}

@media (max-width: 768px) {
    .auth-menu-item {
        width: 100%;
        justify-content: center;
        padding: 1rem 0;
    }
}

@media (max-width: 768px) {
    .nav-controls {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
}
</style>