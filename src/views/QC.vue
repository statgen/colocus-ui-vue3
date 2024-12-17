<template>
  <v-container class="ml-0">
    <v-row>
      <v-col class="ml-n4">
        <h1>Colocalization statistics</h1>
        <p>Overview and description of what this page is about.</p>
      </v-col>
    </v-row>

    <v-row id="qcPanel" class="mt-5">
      <v-col>
        <span class="text-caption">
          Set H4 threshold ({{ filterH4 }})
        </span>
        <v-slider
          @end="onH4SliderUpdate"
          v-model="filterH4"
          :min="0"
          :max="1.0"
          :step="0.05"
          show-ticks="always"
          thumb-size="14"
          width="200"
        ></v-slider>
      </v-col>
      <v-col>
        <span class="text-caption">
          Set r<sup>2</sup> threshold ({{ filterR2 }})
        </span>
        <v-slider
          @end="onR2SliderUpdate"
          v-model="filterR2"
          :min="0"
          :max="1.0"
          :step="0.05"
          show-ticks="always"
          thumb-label
          thumb-size="14"
          width="200"
        ></v-slider>
      </v-col>
      <v-col>
        <v-select
          @update:modelValue="onStudySelectUpdate"
          class="mt-3"
          :items="studyList"
          v-model="selectedStudy"
          density="compact"
          label="omics"
          bg-color="white"
          flat
          variant="outlined"
          width="200"
        ></v-select>
      </v-col>
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
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import embed from 'vega-embed'
import { URLS } from '@/constants'
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
const studyList = ref([])

// UI control variables
const filterH4 = ref(0.5)
const filterR2 = ref(0.3)
const selectedStudy = ref('')

const plotRef = '#colocClassPlot'

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  await loadData()
  const initialStudy = studyList.value[0]
  selectedStudy.value = initialStudy

  await generatePlot(plotRef, colocClassSpec, allColocData, qtlStudies, initialStudy, filterH4.value, filterR2.value)
})

// *** Event handlers **********************************************************
const onH4SliderUpdate = async (newH4value) => {
  await generatePlot(plotRef, colocClassSpec, allColocData, qtlStudies, selectedStudy.value, newH4value, filterR2.value)
}

const onR2SliderUpdate = async (newR2value) => {
  await generatePlot(plotRef, colocClassSpec, allColocData, qtlStudies, selectedStudy.value, filterH4.value, newR2value)
}

const onStudySelectUpdate = async (newStudy) => {
  await generatePlot(plotRef, colocClassSpec, allColocData, qtlStudies, newStudy, filterH4.value, filterR2.value)
}

// *** Utility functions *******************************************************
const generatePlot = async (container, spec, colocData, qtlStudies, study, h4, r2) => {
  console.log(`Building plot for ${study}, h4=${h4}, r2=${r2}`)
  const cfs = getColocDataForStudy(colocData, qtlStudies, study, h4, r2)
  const records = makePlotRecords(cfs)
  spec.data.values = records
  await embed(container, spec)
}

const loadData = async() => {
  if(await fetchData(URLS.QC_COLOC, 'gene check', appStore.currentPageName)) {
    allColocData = data.value.results
  } else {
    console.error('Error loading qc data:', errorMessage)
  }

  qtlStudies.value = getQTLStudies(allColocData)

  studyList.value = [...qtlStudies.value.keys()]

  const initialStudy = studyList.value[0]
  selectedStudy.value = initialStudy
}

// *** Configuration data ******************************************************
</script>

<style scoped>
#qcPanel {
  border: 1px solid #ddd;
  height: 90px;
}
</style>
