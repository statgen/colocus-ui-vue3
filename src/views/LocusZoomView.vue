<template>
    <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
      <FilterPanel />
    </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
      <h1>
        <v-icon icon="mdi-arrow-left-circle" @click="router.back()" class="text-clcAction mx-0 mb-2" size="24px"/>
        Locus Zoom
      </h1>
    </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, provide, ref, watch } from 'vue'
import router from '@/router'
import { useFilterStore } from '@/stores/FilterStore'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the variable and injection for the underlying controls
const preloadGenes = ref([])

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadFPControls.value = !loadFPControls.value
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}
</style>
