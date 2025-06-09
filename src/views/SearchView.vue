<template>
  <v-col v-show="appStore.filterPanelControls.isSidebarShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>
  <v-col :cols="appStore.filterPanelControls.isSidebarShowing ? 10 : 12" class="ml-2">
    <div class="search-header">
      <h1>Search <TutorialOverlay ref="tutorial" :steps="steps" /></h1>
      <p>You are viewing {{ appStore.dataTable.itemCount }} of {{ appStore.dataTable.countPairs }} records.</p>
      <p>Click <v-icon icon="mdi-information-outline" class="info-icon-class" /> above for a Tutorial introduction to this page.</p>
      <p>In the data table below, click <v-icon class="text-clcAction">{{ 'mdi-chevron-down' }}</v-icon>
        in the Expand column to see the Details panel with links to further resources.</p>
      <p>To view Locus Zoom plots for a colocalized pair of interest, click on the row containing the pair, or the button in the Details panel.</p>
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

    <div class="table-container mt-2">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        id="searchDataTable"
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
import steps from '@/tutorials/tutSearchPageSteps'

// *** Composables *************************************************************
const appStore = useAppStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const alertText = ref('')
const alertVisible = ref(false)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const preloadGenes = ref([])
const tutorial = ref()
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
onMounted(async () => {
  loadFilterPanelControls()

  const route = useRoute()
  const geneStr = route.query.gene
  if(!geneStr) {
    loadTableData()
  } else {
    geneListHandler(geneStr)
  }
  await nextTick(() => { appStore.slidersEnabled = true })
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
.table-container {
  overflow-x: auto;
}
</style>
