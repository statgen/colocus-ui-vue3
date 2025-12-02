<template>
  <div v-if="theBiomarkerType === BIOMARKER_TYPES.PHENOTYPE" class="d-inline" >
    <TraitLabelPhenotype :trait="trait" :analysisID="analysisID"/>
  </div>
  <div v-else-if="[BIOMARKER_TYPES.GENE_EXPRESSION, BIOMARKER_TYPES.EXON_EXPRESSION].includes(theBiomarkerType)" class="d-inline" >
    <TraitLabelGene :trait="trait"/>
  </div>
  <div v-else-if="theBiomarkerType === BIOMARKER_TYPES.PROTEIN_EXPRESSION" class="d-inline" >
    <TraitLabelProtein :trait="trait"/>
  </div>
  <div v-else class="d-inline">
    <span>
      {{ trait?.uuid }}
    </span>
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
