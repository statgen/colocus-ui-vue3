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
      <VegaPlotContainer :controlSet="vpc.ColocalizationForStudy" :vegaSpec="colocForStudySpec" />
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
import { colocForStudySpec } from '@/vegaSpecs/colocForStudySpec'

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
