<template>
  <v-container class="ml-0">
    <v-row>
      <v-col class="ml-n4">
        <h1>Colocalization statistics</h1>
        <p>Overview and description of what this page is about.</p>
      </v-col>
    </v-row>

    <v-row>
      <QCPanel />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.ColocalizationClass" :vegaSpec="colocClassSpec" />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.ColocalizationClassError" :vegaSpec="colocClassErrorSpec" />
    </v-row>

    <v-row>
      <v-col class="ml-n3">
        <VegaPlotContainer :controlSet="vpc.r2VsH4ScatterPlot" :vegaSpec="r2VsH4ScatterPlotSpec" />
      </v-col>
      <v-col>
        <VegaPlotContainer :controlSet="vpc.r2VsH4HeatMap" :vegaSpec="r2VsH4HeatMapSpec" />
      </v-col>
    </v-row>

    <v-row>
      <v-col class="ml-n3">
        <VegaPlotContainer :controlSet="vpc.histogramH4" :vegaSpec="histogramH4Spec" />
      </v-col>
      <v-col>
        <VegaPlotContainer :controlSet="vpc.histogramR2" :vegaSpec="histogramR2Spec" />
      </v-col>
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.omicsCountsByGWAS" :vegaSpec="omicsCountsPerGWASSpec" />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.omicsPropsByGWAS" :vegaSpec="omicsPropsPerGWASSpec" />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.signalCountsPerGWAS" :vegaSpec="signalCountsPerGWASSpec" />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.signalPropsPerGWAS" :vegaSpec="signalPropsPerGWASSpec" />
    </v-row>

    <v-row>
      <VegaPlotContainer :controlSet="vpc.signalsPerDataset" :vegaSpec="signalsPerDatasetSpec" />
    </v-row>

  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted } from 'vue'
import { timeLog } from '@/util/util'
import { useQCStore } from '@/stores/QCStore'
import vpc from '@/components/qcPageControls/VegaPlotConfig'
import VegaPlotContainer from "@/components/qcPageControls/VegaPlotContainer.vue"

// *** Vega specs **************************************************************
import { colocClassSpec } from '@/vegaSpecs/colocClassSpec'
import { colocClassErrorSpec } from '@/vegaSpecs/colocClassErrorSpec'
import { r2VsH4ScatterPlotSpec } from '@/vegaSpecs/r2VsH4ScatterPlotSpec'
import { r2VsH4HeatMapSpec } from '@/vegaSpecs/r2VsH4HeatMapSpec'
import { histogramH4Spec } from '@/vegaSpecs/histogramH4Spec'
import { histogramR2Spec } from '@/vegaSpecs/histogramR2Spec'
import { omicsCountsPerGWASSpec } from '@/vegaSpecs/omicsCountsPerGWASSpec'
import { omicsPropsPerGWASSpec } from '@/vegaSpecs/omicsPropsPerGWASSpec'
import { signalCountsPerGWASSpec } from '@/vegaSpecs/signalCountsPerGWASSpec'
import { signalPropsPerGWASSpec } from '@/vegaSpecs/signalPropsPerGWASSpec'
import { signalsPerDatasetSpec } from '@/vegaSpecs/signalsPerDatasetSpec'

// *** Composables *************************************************************
const qcStore = useQCStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  await qcStore.loadQCData()
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
