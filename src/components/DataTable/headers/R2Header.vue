<template>
  <div>
  <span>{{ title }}</span>
  <v-tooltip activator="parent" location="top">
    <span>Linkage disequilibrium (r2) between the lead variants of the two signals</span>
  </v-tooltip>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
})
</script>

<style scoped>
</style>
