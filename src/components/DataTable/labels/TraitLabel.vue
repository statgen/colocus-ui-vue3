<template>
  <div class="d-inline">
    <span v-if="theBiomarkerType === BIOMARKER_TYPES.PHENOTYPE">
      <span v-if="theAbbrev">
        <v-tooltip activator="parent" location="top">
          <span>{{ thePhenotype }}</span>
        </v-tooltip>
        <span class="text-clcAction trait-highlight">{{ theUUID }}</span>
      </span>
      <span v-else :class="highlight ? 'text-indigo-darken-4' : '' ">
        {{ thePhenotype }}
      </span>
    </span>

    <span v-else-if="trait?.gene">
      <span v-if="abbrev">
        <v-tooltip activator="parent" location="top">
          <em>{{ theGene }}</em>
        </v-tooltip>
        {{ middleTrim(theGene, 6, 6) }}
      </span>
      <span v-else>
        <em>{{ theGene }}</em>
      </span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BIOMARKER_TYPES } from '@/constants'
import { middleTrim } from '@/util/util'

const props = defineProps({
  trait: Object,
  abbrev: Boolean,
  highlight: Boolean,
})

const theAbbrev = computed(() => props?.abbrev)
const theBiomarkerType = computed(() => props?.trait?.biomarker_type)
const theGene = computed(() => props?.trait?.gene?.symbol)
const thePhenotype = computed(() => props?.trait?.phenotype?.name)
const theUUID = computed(() => props?.trait?.uuid)
</script>

<style scoped>
.trait-highlight {
  border-bottom: 1px rgba(var(--v-theme-clcAction), 1.0) dashed;
}
</style>
