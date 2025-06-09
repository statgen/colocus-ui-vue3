<template>
  <v-col cols="3">
    <v-row>
      <QCPanel>
        <template #anchors>
          <QCAnchor :config="vpc.signalPropsPerGWAS"/>
          <QCAnchor :config="vpc.signalCountsPerGWAS"/>
          <QCAnchor :config="vpc.omicsPropsPerGWAS"/>
          <QCAnchor :config="vpc.omicsCountsPerGWAS"/>
        </template>
      </QCPanel>
    </v-row>
  </v-col>
  <v-col class="mt-4">
    <v-row>
      <v-col class="ml-n4">
        <v-row>
          <h1 :id="STATS_PAGE_TOP">Summary statistics</h1>
        </v-row>
        <v-row>
          <p>This page contains summary information for GWAS signals colocalized with molecular QTLs
            from a given tissue or cell type. The plots allow comparison of the number (proportion)
            of eQTL colocalized across GWAS and conversely the number (proportion) of GWAS signals
            colocalized with eQTLs from the given tissue or cell type.</p>
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.signalPropsPerGWAS" :vegaSpec="signalPropsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.signalCountsPerGWAS" :vegaSpec="signalCountsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.omicsPropsPerGWAS" :vegaSpec="omicsPropsPerGWASSpec" />
        </v-row>

        <v-row>
          <VegaPlotContainer :controlSet="vpc.omicsCountsPerGWAS" :vegaSpec="omicsCountsPerGWASSpec" />
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
import { nextTick, onMounted } from 'vue'
import { timeLog } from '@/util/util'
import { useQCStore } from '@/stores/QCStore'
import { useAppStore } from '@/stores/AppStore'
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
const appStore = useAppStore()

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
  appStore.slidersEnabled = true
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
