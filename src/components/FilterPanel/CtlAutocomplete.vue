<template>
  <h3 v-html="controlSet.title"></h3>
  <v-autocomplete
    :items="selectListItems"
    :custom-filter="mlc"
    :placeholder="controlSet.placeholder"
    v-model="selectedItems"
    @update:model-value="onModelChanged"

    auto-select-first
    bg-color="white"
    chips
    class="mb-n1"
    closable-chips
    clearable
    density="compact"
    flat
    multiple
    persistent-clear
    variant="outlined"
  ></v-autocomplete>
</template>

<script setup>
// *** Imports *****************************************************************
import { inject, onMounted, ref, watch  } from 'vue'
import { matchLowercase } from '@/util/util'
import { useFilterStore } from '@/stores/FilterStore'
import { PAGE_STORE_DATA_MAP } from '@/constants'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
const { controlSet } = defineProps({
  controlSet: {}
})

// *** Variables ***************************************************************
const selectedItems = ref([])
const selectListItems = ref([])

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
const loadFPControls = inject('loadFPControls')
const preloadGenes = inject('preloadGenes')
// const preloadTrait = inject('preloadTrait')
const resetInput = inject('resetInput')

// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => resetInput.value, () => {
  selectedItems.value = controlSet.defaultValue
  filterStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

watch(() => preloadGenes.value, () => {
  if(controlSet.storeKey === 'genes') {
    selectedItems.value = preloadGenes.value
    filterStore.updateFilter(controlSet.storeKey, preloadGenes.value)
  }
})

// watch(() => preloadTrait.value, () => {
//   if(controlSet.storeKey === 'phenotypes') {
//     selectedItems.value = preloadTrait.value
//     filterStore.updateFilter(controlSet.storeKey, preloadTrait.value)
//   }
// })

watch(() => loadFPControls.value, (newValue, oldValue) => {
  populateControlSelectList()
})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  populateControlSelectList()
  populateControlData()
})

// *** Event handlers **********************************************************
const onModelChanged = (newValue) => {
  filterStore.updateFilter(controlSet.storeKey, newValue)
}

// *** Utility functions *******************************************************
const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

const populateControlSelectList = () => {
  selectListItems.value = filterStore.filterLists[controlSet.storeKey]
}

const populateControlData = () => {
  const parentKey = PAGE_STORE_DATA_MAP[filterStore.currentPageName]
  selectedItems.value = filterStore[parentKey].filters[controlSet.storeKey]
}

// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
