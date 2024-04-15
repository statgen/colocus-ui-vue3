<template>
  <div>
  <span>{{ title }}</span>
  <v-tooltip activator="parent" location="top">
    <span>Number of colocalizations of the two signals</span>
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
