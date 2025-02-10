<template>
  <v-col cols="3">
    <v-row>
      <QCPanel />
    </v-row>
  </v-col>
  <v-col class="mt-4">
    <v-row>
      <v-col class="ml-n4">
        <v-row>
          <h1 :id="STATS_PAGE_TOP">Colocalization statistics</h1>
        </v-row>
        <v-row>
          <p>Overview and description of what this page is about.</p>
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
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted } from 'vue'
import { timeLog } from '@/util/util'
import { useQCStore } from '@/stores/QCStore'
import vpc from '@/components/qcPageControls/VegaPlotConfig'
import VegaPlotContainer from "@/components/qcPageControls/VegaPlotContainer.vue"
import { STATS_PAGE_TOP } from '@/constants'

// *** Vega specs **************************************************************
import { colocClassSpec } from '@/vegaSpecs/colocClassSpec'
import { colocClassErrorSpec } from '@/vegaSpecs/colocClassErrorSpec'
import { r2VsH4ScatterPlotSpec } from '@/vegaSpecs/r2VsH4ScatterPlotSpec'
import { r2VsH4HeatMapSpec } from '@/vegaSpecs/r2VsH4HeatMapSpec'
import { histogramH4Spec } from '@/vegaSpecs/histogramH4Spec'
import { histogramR2Spec } from '@/vegaSpecs/histogramR2Spec'

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
