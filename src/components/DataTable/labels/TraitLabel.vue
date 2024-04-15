<template>
  <div>
    <span v-if="trait.biomarker_type === BIOMARKER_TYPES.PHENOTYPE">
      <span v-if="abbrev">
        <v-tooltip activator="parent" location="top">
          <span>{{ trait.phenotype.name }}</span>
        </v-tooltip>
        <span>{{ trait.uuid }}</span>
      </span>
      <span v-else :class="highlight ? 'text-indigo-darken-4' : '' ">
        {{ trait.phenotype.name }}
      </span>
    </span>

    <span v-else-if="trait.gene">
      <span v-if="abbrev">
        <v-tooltip activator="parent" location="top">
          <em>{{ trait.gene.symbol }}</em>
        </v-tooltip>
        {{ middleTrim(trait.gene.symbol, 6, 6) }}
      </span>
      <span v-else>
        <em>{{ trait.gene.symbol }}</em>
      </span>
    </span>
  </div>
</template>

<script setup>
import { BIOMARKER_TYPES } from '@/constants'
import { middleTrim } from '@/util/util'

const props = defineProps({
  trait: Object,
  abbrev: Boolean,
  highlight: Boolean,
})
</script>

<style scoped>
</style>
