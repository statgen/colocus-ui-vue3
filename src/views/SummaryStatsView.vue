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
          <VegaPlotContainer :controlSet="vpc.omicsCountsPerGWAS" :vegaSpec="omicsCountsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.omicsPropsPerGWAS" :vegaSpec="omicsPropsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.signalCountsPerGWAS" :vegaSpec="signalCountsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.signalPropsPerGWAS" :vegaSpec="signalPropsPerGWASSpec" />
        </v-row>

<!--        <v-row>-->
<!--          <VegaPlotContainer :controlSet="vpc.signalsPerDataset" :vegaSpec="signalsPerDatasetSpec" />-->
<!--        </v-row>-->
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
import { omicsCountsPerGWASSpec } from '@/vegaSpecs/omicsCountsPerGWASSpec'
import { omicsPropsPerGWASSpec } from '@/vegaSpecs/omicsPropsPerGWASSpec'
import { signalCountsPerGWASSpec } from '@/vegaSpecs/signalCountsPerGWASSpec'
import { signalPropsPerGWASSpec } from '@/vegaSpecs/signalPropsPerGWASSpec'
// import { signalsPerDatasetSpec } from '@/vegaSpecs/signalsPerDatasetSpec'

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
