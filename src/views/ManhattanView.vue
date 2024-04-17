<template>
  <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <h1>
      <v-icon icon="mdi-arrow-left-circle" @click="router.back()" class="text-clcAction mx-0 mb-2" size="24px"/>
      Manhattan Plot <span class="zzz">(trait_study: {{ analysisID }})</span>
    </h1>
    <div class="table-container">
      <DataTable
        @row-click="onDataTableRowClick"
      ></DataTable>
    </div>

  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, provide, ref } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router';
import { useFilterStore } from '@/stores/FilterStore'


// *** Composables *************************************************************
const route = useRoute();
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const analysisID = useRoute().params.analysis_id;
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
})
// *** Event handlers **********************************************************
const onDataTableRowClick = () => {
  consol.log('DataTableRowClick')
}

// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.zzz {
  font-size: 1rem;
}

.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: auto;
}
</style>
