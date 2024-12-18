<template>
  <v-container class="ml-n4">
    <h2>{{ controlSet.heading }}</h2>
    <p>{{ controlSet.description }}</p>
<!--    <div :id="controlSet.domID"></div>-->
    <div id="plot1">plot1</div>
  </v-container>
</template>

<script setup>
import { nextTick, watch } from 'vue'
import embed from 'vega-embed'
import { useQCPageHelpers } from '@/composables/qcPageHelpers'
import { useQCPlotRecords } from '@/composables/qcPlotRecords'
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
  console.log('in watch, domID', controlSet.domID)
  await nextTick()

  await generatePlot(
    controlSet.domID, //plotRef,
    vegaSpec, //colocClassSpec,
    appStore[qcPage].allColocData,
    appStore[qcPage].qtlStudies,
    appStore[qcPage].selectedStudy,
    appStore[qcPage].h4Threshold,
    appStore[qcPage].r2Threshold
  )
})

</script>

<style scoped>
</style>
