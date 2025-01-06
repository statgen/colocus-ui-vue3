<template>
  <v-container class="ml-n4">
    <h2>{{ controlSet.heading }}</h2>
    <p>{{ controlSet.description }}</p>
    <div :id="controlSet.container"></div>
<!--    <div id="plot1">plot1</div>-->
  </v-container>
</template>

<script setup>
import { watch } from 'vue'
import { useQCPageHelpers } from '@/composables/qcPageHelpers'
import { PAGE_NAMES } from '@/constants'
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()
const { generatePlot } = useQCPageHelpers();

const qcPage = PAGE_NAMES.QC

const { controlSet, vegaSpec } = defineProps({
  controlSet: {},
  vegaSpec: {},
})

watch(() => appStore[qcPage].regenPlotFlag, async () => {
  await generatePlot({
    container: controlSet.container,
    spec: vegaSpec,
    data: appStore[qcPage].allColocData,
    studies: appStore[qcPage].qtlStudies,
    study: appStore[qcPage].selectedStudy,
    h4: appStore[qcPage].h4Threshold,
    r2: appStore[qcPage].r2Threshold
  })
})

</script>

<style scoped>
</style>
