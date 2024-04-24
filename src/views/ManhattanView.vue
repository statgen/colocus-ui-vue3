<template>
  <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <v-row class="mx-0 my-0">
      <h1>
        <v-icon icon="mdi-arrow-left-circle" @click="router.back()" class="text-clcAction mx-0 mb-2" size="24px"/>
        Manhattan Plot
      </h1>
    </v-row>
    <v-row class="ml-2 plot-container">
      <ManhattanPlot
        :binData = manhattanData
        @onSelectSignals="addSignals"
      />
    </v-row>
    <v-row class="ml-2">
        <h2 v-if="Object.keys(selectedSignals).length===0">All colocalized signals</h2>
        <div v-else>
          <h2>Selected colocalized signals</h2>
          <div style="display: flex; flex-wrap: wrap;">
          <VariantLabel v-for="signal in sortedSignals" :key="signal"
            :variant="signal.variant"
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
          @row-click="onDataTableRowClick"
          @select_signals="addSignals"
        ></DataTable>
      </div>
    </v-row>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import {computed, onMounted, provide, ref} from 'vue'
import router from '@/router'
import {useFilterStore} from '@/stores/FilterStore'
import VariantLabel from "@/components/DataTable/labels/VariantLabel.vue";


// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const manhattanData = filterStore.manhattanData
const preloadGenes = ref([])
const selectedSignals = ref({})

// *** Computed ****************************************************************
function parseVariant(variant) {
  const parts = variant.split('_')
  return {
    chromosome: parseInt(parts[0]),
    location: parseInt(parts[1]),
    rest: parts.slice(2).join('_')
  }
}

const sortedSignals = computed(() => {
  const signalsArray = Object.values(selectedSignals.value)
  return signalsArray.sort((a, b) => {
    const parsedA = parseVariant(a.variant)
    const parsedB = parseVariant(b.variant)
    if (parsedA.chromosome !== parsedB.chromosome) {
      return parsedA.chromosome - parsedB.chromosome
    }
    if (parsedA.location !== parsedB.location) {
      return parsedA.location - parsedB.location
    }
    return parsedA.rest.localeCompare(parsedB.rest)
  })
})

// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('preloadGenes', preloadGenes)
provide('loadTableDataFlag', loadTableDataFlag)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFilterControls()
  loadTableData()
  // plot data comes from the filterStore, is loaded by the route beforeEnter
})
// *** Event handlers **********************************************************
const onDataTableRowClick = () => {
  console.log('DataTableRowClick')
}

// *** Utility functions *******************************************************
const loadFilterControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadTableData = () => {
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const addSignals = (signals) => {
  for (const signal of signals) {
    const key = signal.signal_uuid
    // console.log('k, v:', key, signal)
    const existingVariants = Object.values(selectedSignals.value).map(item => item.variant)
    console.log('ev:', existingVariants)
    if (existingVariants.includes(signal.variant)) {
      // console.log('skipping dupe:', signal.variant)
    } else {
      // console.log('adding signal:', key, signal)
      selectedSignals.value[key] = signal
    }
  }
  filterStore.updateFilter('signals', Object.keys(selectedSignals.value))
}

const removeSignal = (signal) => {
  delete selectedSignals.value[signal.signal_uuid]
  filterStore.updateFilter('signals', Object.keys(selectedSignals.value))
}

const clearSignals = () => {
  selectedSignals.value = {}
  filterStore.updateFilter('signals', Object.keys(selectedSignals.value))
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

.custom-chip {
  background: none !important;
  background-color: transparent !important;
}
</style>
