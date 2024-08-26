<template>
  <div>
    <span>{{ theAbbrev ? middleTrim(theStudy, 3, 6) : study }}</span>
    <v-tooltip activator="parent" location="top">
      {{ theStudy }}
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { middleTrim } from '@/util/util'

const props = defineProps({
  study: String,
  abbrev: Boolean,
})

const theStudy = computed(() => props?.study)
const theAbbrev = computed(() => props?.abbrev)
</script>

<style scoped>
</style>
