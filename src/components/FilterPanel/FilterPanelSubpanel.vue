<template>
  <v-sheet color="grey-lighten-4" elevation="0" border class="px-2 mt-2">
    <h2 class="panel-title mb-2 text-blue-darken-1">{{ title }}</h2>
    <slot />
  </v-sheet>
</template>

<script setup>
defineProps(['title'])
</script>

<style scoped>
.panel-title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
