<template>
    <h2>Link Utili</h2>
    <ul>
        <li v-for="{ link, label } in props.links">
            <a :href="link">{{ label }}</a>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import type { ExternalLink } from '~~/shared/financial';


const props = defineProps<{
    links: ExternalLink[];
}>();
</script>