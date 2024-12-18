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

    <v-row class="mt-6">
      <h2>Plot 1: Colocalization class</h2>
    </v-row>
    <v-row>
      <p>Plot 1 description</p>
    </v-row>
    <v-row>
      <v-col>
        <div id="colocClassPlot"></div>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, ref, watch } from 'vue'
import embed from 'vega-embed'
import { PAGE_NAMES, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import colocClassSpec from '@/vegaSpecs/colocClassSpec.js'
import { useQCPageHelpers } from '@/composables/qcPageHelpers'
import { useQCPlotRecords } from '@/composables/qcPlotRecords'

// *** Composables *************************************************************
const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()
const { getColocDataForStudy, getQTLStudies } = useQCPageHelpers();
const { makePlotRecords } = useQCPlotRecords();

// *** Props *******************************************************************
// *** Variables ***************************************************************
// data variables
let allColocData
const qtlStudies = ref({})

// constants
const qcPage = PAGE_NAMES.QC

// dom plot refs
const plotRef = '#colocClassPlot'

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore[qcPage].regenPlotFlag, async () => {
  await generatePlot(plotRef, colocClassSpec, allColocData, qtlStudies,
    appStore[qcPage].selectedStudy,
    appStore[qcPage].h4Threshold,
    appStore[qcPage].r2Threshold
  )
})

// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  await loadData()
  appStore[qcPage].regenPlotFlag = !appStore[qcPage].regenPlotFlag
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const generatePlot = async (container, spec, colocData, qtlStudies, study, h4, r2) => {
  console.log(`Building plot for ${study}, h4=${h4}, r2=${r2}`)
  const cfs = getColocDataForStudy(colocData, qtlStudies, study, h4, r2)
  spec.data.values = makePlotRecords(cfs)
  await embed(container, spec)
}

const loadData = async() => {
  if(await fetchData(URLS.QC_COLOC, 'gene check', appStore.currentPageName)) {
    allColocData = data.value.results
  } else {
    console.error('Error loading qc data:', errorMessage)
  }

  qtlStudies.value = getQTLStudies(allColocData)
  appStore[qcPage].studyList = [...qtlStudies.value.keys()]
}

// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
