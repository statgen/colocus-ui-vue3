<template>
  <v-container class="ml-n4">
    <h2>{{ controlSet.heading }}</h2>
    <p>{{ controlSet.description }}</p>
    <div :id="controlSet.container"></div>
  </v-container>
</template>

<script setup>
import { watch } from 'vue'
import { useQCPageHelpers } from '@/composables/qcPageHelpers'
import { PAGE_NAMES } from '@/constants'
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()
const { generatePlot } = useQCPageHelpers();

const qcPage = PAGE_NAMES.QC

const { controlSet, vegaSpec } = defineProps({
  controlSet: {},
  vegaSpec: {},
})

watch(() => qcStore.regenPlotFlag, async () => {
  await generatePlot({
    container: controlSet.container,
    spec: vegaSpec,
    data: qcStore.allColocData,
    studies: qcStore.qtlStudies,
    study: qcStore.selectedStudy,
    h4: qcStore.h4Threshold,
    r2: qcStore.r2Threshold
  })
})

</script>

<style scoped>
</style>
