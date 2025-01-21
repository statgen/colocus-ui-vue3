<template>
  <v-container class="ml-n4">
    <h2>{{ title }}</h2>
    <p>{{ controlSet.description }}</p>

    <div v-if="showPlot"
       :id="domID"
       :style="{
         width: controlSet.containerWidth + 'px',
         height: controlSet.containerHeight + 'px'
       }"
    ></div>
    <p v-else class="text-error">⚠️ No records in this dataset; no plot can be shown.</p>

  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { ref, watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'
import embed from 'vega-embed'
import { timeLog } from '@/util/util'

// *** Composables *************************************************************
const qcStore = useQCStore()

// *** Props *******************************************************************
const { controlSet, vegaSpec } = defineProps({
  controlSet: {},
  vegaSpec: {},
})

// *** Variables ***************************************************************
const domID = ref('plot' + controlSet.plotID)
const showPlot = ref(true)
const title = ref('')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => qcStore.regenPlotFlag, async (newVal, oldVal) => {
  const dk = controlSet.dataKey

  if(qcStore[dk].length < 1) {
    showPlot.value = false
    return
  }

  vegaSpec.data.values = qcStore[dk]

  // this is for the layered plots (7 ...)
  if(controlSet.plotWidth) {
    vegaSpec.vconcat[0].width = controlSet.plotWidth
    vegaSpec.vconcat[1].width = controlSet.plotWidth
  }

  const titleString = controlSet.title.replace('%s', qcStore.selectedStudyName)
  title.value = `Plot ${controlSet.plotID}: ${titleString}`
  vegaSpec.title = titleString

  const domSelector = `#${domID.value}`

  timeLog('embed start', domID.value, controlSet.dataKey)
  await embed(domSelector, vegaSpec, vegaOptions)
  timeLog('embed stop', domID.value, controlSet.dataKey)
})

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
const vegaOptions = {
  actions: {
    export: true,
    source: false,
    compiled: false,
    editor: false,
  }
}
</script>

<style scoped>
</style>
