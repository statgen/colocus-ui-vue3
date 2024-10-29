<template>
  <v-col v-show="appStore.filterPanelControls.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="appStore.filterPanelControls.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <div class="search-header">
      <h1>Search</h1>
      <p>You are viewing {{ appStore.dataTable.itemCount }} of {{ appStore.dataTable.countPairs }} records.</p>
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
import { nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRoute } from "vue-router";
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'
import router from '@/router'

// *** Composables *************************************************************
const appStore = useAppStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const alertText = ref('')
const alertVisible = ref(false)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const preloadGenes = ref([])
// const preloadTrait = ref('')

const locuszoomPage = PAGE_NAMES.LOCUSZOOM
const searchPage = PAGE_NAMES.SEARCH

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('preloadGenes', preloadGenes)
// provide('preloadTrait', preloadTrait)
provide('loadTableDataFlag', loadTableDataFlag)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore[searchPage].pastedGenes, (newVal, oldVal) => {
  // console.log('pasted genes: nv:', newVal, 'ov:', oldVal)
  if(newVal) geneListHandler(appStore[searchPage].pastedGenes)
  appStore[searchPage].pastedGenes = null
})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFilterPanelControls()

  const route = useRoute()
  const geneStr = route.query.gene
  if(!geneStr) {
    loadTableData()
  } else {
    geneListHandler(geneStr)
  }
})

// *** Event handlers **********************************************************
const onDataTableRowClick = async (item) => {
  await router.push({name: locuszoomPage, params: {}})
}

// *** Utility functions *******************************************************
const loadFilterPanelControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadTableData = () => {
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const geneListHandler = (genes) => {
  const { goodGenes, badGenes } = appStore.checkGenes(genes)
  // console.log('bad genes length:', badGenes.length)
  if(badGenes.length > 0) {
    // console.log(badGenes)
    alertText.value = `Invalid gene(s): ${badGenes.join(', ')}`
    alertVisible.value = false
    nextTick(() => {
      alertVisible.value = true
    })
    setTimeout(() => { alertVisible.value = false }, 10000)
  }
  if(goodGenes.length > 0) {
    preloadGenes.value = goodGenes
  } else {
    loadTableData()
  }
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
