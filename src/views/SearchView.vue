<template>
  <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <div class="search-header">
      <h1>Search</h1>
      <p>
        See top colocalization results across all signal pairs for any combination of traits.
        Use the filters at left to narrow your search. Click on a row to see LocusZoom plots for that result.
        You are viewing <span class="text-blue-darken-4">{{ filterStore.itemCount }}</span>
        of the <span class="text-indigo-darken-4">{{ filterStore.countPairs }}</span>
        total signal pairs in this dataset.
      </p>
    </div>
    <v-alert
      title="Invalid gene(s) specified"
      :text="alertText"
      :model-value="alertVisible"
      type="warning"
      density="comfortable"
      variant="outlined"
      closable
      max-width="50%"
    ></v-alert>
    <div class="table-container">
      <DataTable
        @row-click="onDataTableRowClick"
      ></DataTable>
    </div>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, provide, ref, watch } from 'vue'
import { useRoute } from "vue-router";
import { useFilterStore } from '@/stores/FilterStore'
import router from '@/router'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const alertText = ref('')
const alertVisible = ref(false)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const preloadGenes = ref([])

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('preloadGenes', preloadGenes)
provide('loadTableDataFlag', loadTableDataFlag)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFPControls.value = !loadFPControls.value

  const route = useRoute()
  const geneStr = route.query.gene
  if(!geneStr) {
    loadTableDataFlag.value = !loadTableDataFlag.value
  } else {
    const { goodGenes, badGenes } = filterStore.checkGenes(geneStr)
    if(badGenes.length > 0) {
      alertText.value = `Invalid gene(s): ${badGenes.join(', ')}`
      alertVisible.value = true
    }
    if(goodGenes.length > 0) {
      preloadGenes.value = goodGenes
    } else {
      loadTableDataFlag.value = !loadTableDataFlag.value
    }
  }
})

// *** Event handlers **********************************************************
const onDataTableRowClick = () => {
  console.log('dataTableRowClick')
  router.push({ name: 'locuszoom', params: {} })
}

// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: auto;
}
</style>
