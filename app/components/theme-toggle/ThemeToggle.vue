<template>
    <button @click="toggleTheme" class="theme-toggle"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'">
        <div class="toggle-slider" :class="{ 'dark': isDark }">
            <span class="toggle-icon">
                {{ isDark ? '🌙' : '☀️' }}
            </span>
        </div>
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

onMounted(() => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        isDark.value = true
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark')
        isDark.value = false
    } else {
        isDark.value = document.documentElement.classList.contains('dark')
    }
})

const toggleTheme = () => {
    isDark.value = !isDark.value

    if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }
}
</script>

<style scoped>
.theme-toggle {
    position: relative;
    width: 48px;
    height: 24px;
    border-radius: 12px;
    background-color: var(--color-background-alt);
    border: none;
    cursor: pointer;
    padding: 2px;
    transition: background-color 0.3s ease;
}

.toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: var(--color-background);
    border-radius: 50%;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-slider.dark {
    transform: translateX(24px);
}

.toggle-icon {
    font-size: 12px;
}
</style>
