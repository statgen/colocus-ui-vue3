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
import { nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRoute } from "vue-router";
import { useFilterStore } from '@/stores/FilterStore'

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
watch(() => filterStore.pastedGenes, (newVal, oldVal) => {
  // console.log('pasted genes: nv:', newVal, 'ov:', oldVal)
  if(newVal) geneListHandler(filterStore.pastedGenes)
  filterStore.pastedGenes = null
})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFilterControls()

  const route = useRoute()
  const geneStr = route.query.gene
  if(!geneStr) {
    loadTableData()
  } else {
    geneListHandler(geneStr)
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

/* genes for testing
   A2M,AAMP,PDF
   A2M,AAMP,PDF,
   A2M,AAMP,PDF,x
   A2M,AAMP,\t\r\n\n   PDF,y
   A2M,A2ML1-AS1,AAGAB,AAK1,AAMP,ABCA1,ABCA8,ABCG5,ABCG8,ABHD12,ABLIM3,ABTB1,ENSG00000000938,x,y
   A2M	A2ML1-AS1	AAGAB	AAK1	AAMP	ABCA1	ABCA8	ABCG5	ABCG8	ABHD12	ABLIM3	ABTB1	ENSG00000000938	x	y

z
vv
x1

*/
const geneListHandler = (genes) => {
  const { goodGenes, badGenes } = filterStore.checkGenes(genes)
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
