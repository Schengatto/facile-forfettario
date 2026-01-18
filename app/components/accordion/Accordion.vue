<template>
  <div class="accordion">
    <div class="header btn-link" @click="toggleInfo">
      <h2 class="title">{{ title }}</h2>

      <div class="arrow" :class="{ open: infoToggler }"></div>
    </div>

    <div class="content" v-if="infoToggler">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const infoToggler = ref(false);

const toggleInfo = () => {
  infoToggler.value = !infoToggler.value;
};

const { title } = defineProps<{
  title: string;
}>();
</script>

<style scoped>
.accordion {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 12px auto;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

/* Header cliccabile */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 6px 0;
}

/* Titolo */
.title {
  font-size: 18px;
  margin: 0;
}

/* Freccia CSS */
.arrow {
  width: 10px;
  height: 10px;
  border-right: 2px solid #444;
  border-bottom: 2px solid #444;
  transform: rotate(45deg);
  transition: transform 0.25s ease;
}

/* Quando aperta, ruota di 180° */
.arrow.open {
  transform: rotate(-135deg);
}

/* Contenuto */
.content {
  margin-top: 10px;
}
</style>
