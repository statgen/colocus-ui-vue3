<template>
  <SidebarLayout>
    <template #sidebar>
      <QCPanel>
        <template #anchors>
          <QCAnchor :config="vpc.ColocalizationClass"/>
          <QCAnchor :config="vpc.ColocalizationClassError"/>
          <QCAnchor :config="vpc.r2VsH4ScatterPlot"/>
          <QCAnchor :config="vpc.r2VsH4HeatMap"/>
          <QCAnchor :config="vpc.histogramH4"/>
          <QCAnchor :config="vpc.histogramR2"/>
        </template>
      </QCPanel>
    </template>

    <h1 :id="STATS_PAGE_TOP">Colocalization statistics</h1>
    <p>This page provides a picture of the quality of the fine-mapped data underlying the colocalized signals.</p>

    <VegaPlotContainer :controlSet="vpc.ColocalizationClass" :vegaSpec="colocClassSpec" />
    <VegaPlotContainer :controlSet="vpc.ColocalizationClassError" :vegaSpec="colocClassErrorSpec" />

    <p class="text-content-block mx-4">
      Ideally, for colocalized signals the H4 - the posterior probability that both traits are
      associated and share the same single causal variant - will be close to 1. Also, ideally
      the lead colocalized GWAS and the molecular QTL variants for the signal will have an r²
      close to 1. Signals with lower H4 and/or r² can indicate signals which may be more likely
      to be false positives. Lower values H4 and/or r² can occur because poor fine mapping
      (which can be due to insufficient sample size) or because the fine-mapped signals do not
      represent a shared causal variant. Note, some studies only test for colocalization for
      signals with lead GWAS and QTL variants with r² > 0.5.
    </p>

    <div class="two-column-layout">
      <div class="left-panel">
        <VegaPlotContainer :controlSet="vpc.r2VsH4ScatterPlot" :vegaSpec="r2VsH4ScatterPlotSpec" />
        <VegaPlotContainer :controlSet="vpc.histogramH4" :vegaSpec="histogramH4Spec" />
      </div>
      <div class="right-panel">
        <VegaPlotContainer :controlSet="vpc.r2VsH4HeatMap" :vegaSpec="r2VsH4HeatMapSpec" />
        <VegaPlotContainer :controlSet="vpc.histogramR2" :vegaSpec="histogramR2Spec" />
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { nextTick, onMounted } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useQCStore } from '@/stores/QCStore'
import { useAppStore } from '@/stores/AppStore'
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
.two-column-layout {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
}

.left-panel {
  width: 600px;
  flex-shrink: 0;
}

.right-panel {
  width: 600px;
  flex-shrink: 0;
}
</style>
