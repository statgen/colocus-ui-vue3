<template>
  <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <div class="search-header">
      <h1>Search</h1>
      <p>You are viewing {{ filterStore.itemCount }} of {{ filterStore.countPairs }} records.</p>
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
        @onDataTableRowClick="onDataTableRowClick"
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
import { PAGE_NAMES } from '@/constants'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const alertText = ref('')
const alertVisible = ref(false)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const preloadGenes = ref([])
// const preloadTrait = ref('')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('preloadGenes', preloadGenes)
// provide('preloadTrait', preloadTrait)
provide('loadTableDataFlag', loadTableDataFlag)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFilterControls()

  const route = useRoute()
  const geneStr = route.query.gene
  if(!geneStr) {
    loadTableData()
  } else {
    const { goodGenes, badGenes } = filterStore.checkGenes(geneStr)
    if(badGenes.length > 0) {
      alertText.value = `Invalid gene(s): ${badGenes.join(', ')}`
      alertVisible.value = true
    }
    if(goodGenes.length > 0) {
      preloadGenes.value = goodGenes
    } else {
      loadTableData()
    }
  }
})

// *** Event handlers **********************************************************
const onDataTableRowClick = (item) => {
  console.log('sv: dataTableRowClick')
  // router.push({ name: PAGE_NAMES.LOCUSZOOM, params: { } })
}

// *** Utility functions *******************************************************
const loadFilterControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadTableData = () => {
  loadTableDataFlag.value = !loadTableDataFlag.value
}


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
