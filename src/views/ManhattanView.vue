<template>
  <v-col v-show="appStore.filterControls.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="appStore.filterControls.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <v-row class="mx-0 my-0">
      <h1><BackButton />Manhattan Plot <span class="analysis-id">({{ analysisID }})</span></h1>
    </v-row>
    <v-row class="ml-2 mt-14 plot-container">
      <ManhattanPlot
        @onSelectSignals="addSignals"
      />
    </v-row>
    <v-row class="ml-2 mt-4">
        <h2 v-if="Object.keys(selectedSignals).length===0">All colocalized signals</h2>
        <div v-else>
          <h2>Selected colocalized signals</h2>
          <div style="display: flex; flex-wrap: wrap;">
          <VariantLabel v-for="signal in sortedSignals" :key="signal"
            :variant="signal"
            :show-splotch="false"
            :show-close="true"
            :margin-left="4"
            @onClose="removeSignal(signal)"
          />

          <v-btn
            class="text-clcAction ml-2"
            variant="tonal"
            size="small"
            @click="clearSignals"
          >
            Clear
          </v-btn>
          </div>
        </div>
    </v-row>
    <v-row>
      <div class="table-container mt-2">
        <DataTable
          @onDataTableRowClick="onDataTableRowClick"
          @select_signals="addSignals"
        ></DataTable>
      </div>
    </v-row>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import {computed, onMounted, onUpdated, provide, ref} from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useRoute } from 'vue-router'
import VariantLabel from '@/components/DataTable/labels/VariantLabel.vue'
import { sortVariantArray } from '@/util/util'

// *** Composables *************************************************************
const appStore = useAppStore()
const route = useRoute();

// *** Props *******************************************************************
// *** Variables ***************************************************************
const analysisID = ref('')
const lastAnalysisID = ref('')
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const loadManhattanDataFlag = ref(false)
const preloadGenes = ref([])
// const preloadTrait = ref('')
const selectedSignals = ref({})

// *** Computed ****************************************************************
const sortedSignals = computed(() => {

  let variants = Object.values(selectedSignals.value).map(item => item.variant)

  // variants = Array.from(variants)
  variants = sortVariantArray(variants)
  return variants
  //return sortVariantArray(Object.values(selectedSignals.value))
})

// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadManhattanDataFlag', loadManhattanDataFlag)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)
// provide('preloadTrait', preloadTrait)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  // console.log('onMounted')
  analysisID.value = getAnalysisID()
  lastAnalysisID.value = analysisID.value

  // preloadTrait.value = appStore.preloadTrait

  loadFilterControls()
  loadTableData()
  loadManhattanData()
})

onUpdated(() => {
  // console.log('onUpdated')
  const aid = getAnalysisID()
  if(aid === lastAnalysisID.value) return

  analysisID.value = aid
  lastAnalysisID.value = aid
  loadManhattanData()
})
// *** Event handlers **********************************************************
const onDataTableRowClick = () => {
  // console.log('mv: DataTableRowClick')
}

// *** Utility functions *******************************************************
const getAnalysisID = () => {
  return route.params.analysisID
}

const loadFilterControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadManhattanData = () => {
  loadManhattanDataFlag.value = !loadManhattanDataFlag.value
}

const loadTableData = () => {
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const addSignals = (signals) => {
  for (const signal of signals) {
    const key = signal.signal_uuid
    // console.log('k, v:', key, signal)
    const existingVariants = Object.values(selectedSignals.value).map(item => item.variant)
    // console.log('ev:', existingVariants)
    if (existingVariants.includes(signal.variant)) {
      // console.log('skipping dupe:', signal.variant)
    } else {
      // console.log('adding signal:', key, signal)
      selectedSignals.value[key] = signal
    }
  }
  appStore.updateFilter('signals', Object.keys(selectedSignals.value))
}

const removeSignal = (variant) => {
  const keyToDelete = Object.keys(selectedSignals.value).find(key => selectedSignals.value[key].variant === variant);
  if (keyToDelete) {
    delete selectedSignals.value[keyToDelete];
    appStore.updateFilter('signals', Object.keys(selectedSignals.value))
  }
}

const clearSignals = () => {
  selectedSignals.value = {}
  appStore.updateFilter('signals', Object.keys(selectedSignals.value))
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  margin-left: 10px;
  max-height: 600px;
}

.plot-container {
  display: block;
  margin-left: 2px;
  max-height: 325px;
  width: 100%;
}

.analysis-id {
  font-size: 1rem;
}
</style>
