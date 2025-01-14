<template>
  <v-container class="ml-n4">
    <h2>{{ controlSet.heading }}</h2>
    <p>{{ controlSet.description }}</p>

    <div v-if="showPlot"
       :id="controlSet.containerID"
       :style="{
         width: controlSet.width + 'px',
         height: controlSet.height + 'px'
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
const showPlot = ref(true)

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

  const domID = `#${controlSet.containerID}`

  vegaSpec.data.values = qcStore[dk]
  // vegaSpec.width = controlSet.width

  // if(controlSet.containerID === 'plot03') {
    timeLog('cs', controlSet)
  //   timeLog('data', qcStore[dk])
  //   timeLog('vs', vegaSpec)
  //   return
  // }

  timeLog('embed start', controlSet.containerID, controlSet.dataKey)
  await embed(domID, vegaSpec, vegaOptions)
  timeLog('embed stop', controlSet.containerID, controlSet.dataKey)
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
