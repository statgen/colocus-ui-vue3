<template>
  <SidebarLayout>
    <template #sidebar>
      <QCPanel>
        <template #anchors>
          <QCAnchor :config="vpc.signalPropsPerGWAS"/>
          <QCAnchor :config="vpc.signalCountsPerGWAS"/>
          <QCAnchor :config="vpc.omicsPropsPerGWAS"/>
          <QCAnchor :config="vpc.omicsCountsPerGWAS"/>
        </template>
      </QCPanel>
    </template>

    <h1 :id="STATS_PAGE_TOP">Summary statistics</h1>

    <p>
      This page contains summary information for GWAS signals colocalized with molecular QTLs
      from a given tissue or cell type. The plots allow comparison of the number (proportion)
      of eQTL colocalized across GWAS and conversely the number (proportion) of GWAS signals
      colocalized with eQTLs from the given tissue or cell type.
    </p>

    <VegaPlotContainer :controlSet="vpc.signalPropsPerGWAS" :vegaSpec="signalPropsPerGWASSpec" />
    <VegaPlotContainer :controlSet="vpc.signalCountsPerGWAS" :vegaSpec="signalCountsPerGWASSpec" />
    <VegaPlotContainer :controlSet="vpc.omicsPropsPerGWAS" :vegaSpec="omicsPropsPerGWASSpec" />
    <VegaPlotContainer :controlSet="vpc.omicsCountsPerGWAS" :vegaSpec="omicsCountsPerGWASSpec" />
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
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
  appStore.isSidebarShowing = true
  await qcStore.loadQCData()
  appStore.slidersEnabled = true
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
