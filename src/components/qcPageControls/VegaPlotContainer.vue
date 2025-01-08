<template>
  <v-container class="ml-n4">
    <h2>{{ controlSet.heading }}</h2>
    <p>{{ controlSet.description }}</p>
    <div :id="controlSet.containerID" class="plotContainer"></div>
  </v-container>
</template>

<script setup>
import { watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'
import embed from 'vega-embed'
import { timeLog } from '@/util/util'

const qcStore = useQCStore()


const { controlSet, vegaSpec } = defineProps({
  controlSet: {},
  vegaSpec: {},
})

const vegaOptions = {
  actions: {
    export: true,
    source: false,
    compiled: false,
    editor: false,
    }
}

watch(() => qcStore.regenPlotFlag, async (newVal, oldVal) => {
  qcStore.makePlotRecords()
  timeLog(`plotRecords length:, ${qcStore.plotRecords.length}`)

  vegaSpec.data.values = qcStore.plotRecords
  const container = `#${controlSet.containerID}`

  timeLog('embed start')
  await embed(container, vegaSpec, vegaOptions)
  timeLog('embed stop')
})

</script>

<style scoped>
.plotContainer {
  width: 800px;
}
</style>
