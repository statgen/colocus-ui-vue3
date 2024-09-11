<template>
  <div v-if="theBiomarkerType === BIOMARKER_TYPES.PHENOTYPE" class="d-inline" >
    <TraitLabelPhenotype :trait="trait" :analysisID="analysisID"/>
  </div>
  <div v-else class="d-inline">
    <TraitLabelGene :trait="trait"/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BIOMARKER_TYPES, URLS } from '@/constants'

const props = defineProps({
  analysisID: String,
  trait: Object,
})

const theBiomarkerType = computed(() => props?.trait?.biomarker_type)

</script>
<style scoped>
</style>
