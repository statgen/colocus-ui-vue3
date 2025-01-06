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
      <VegaPlotContainer :controlSet="VegaPlotConfig.ColocalizationClass" :vegaSpec="colocClassSpec" />
    </v-row>

  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted } from 'vue'
import { useQCStore } from '@/stores/QCStore'
import colocClassSpec from '@/vegaSpecs/colocClassSpec.js'
import VegaPlotConfig from '@/components/qcPageControls/VegaPlotConfig'

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
