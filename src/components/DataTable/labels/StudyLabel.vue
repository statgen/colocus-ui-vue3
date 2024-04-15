<template>
  <div>
    <span>{{ abbrev ? middleTrim(study, 3, 6) : study }}</span>
    <v-tooltip activator="parent" location="top">
      {{ study }}
    </v-tooltip>
  </div>
</template>

<script setup>
import { middleTrim } from '@/util/util'

const props = defineProps({
  study: String,
  abbrev: Boolean,
})
</script>

<style scoped>
</style>
