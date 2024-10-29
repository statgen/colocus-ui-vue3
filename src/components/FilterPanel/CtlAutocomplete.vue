<template>
  <h3 v-html="controlSet.title"></h3>
  <v-autocomplete
    :items="selectListItems"
    :custom-filter="mlc"
    :placeholder="controlSet.placeholder"
    v-model="selectedItems"
    @update:model-value="onModelChanged"
    @paste="onGenesPaste"

    auto-select-first
    bg-color="white"
    chips
    class="mb-n1"
    clear-on-select
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
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from "@/constants";

// *** Composables *************************************************************
const appStore = useAppStore()

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
  appStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

watch(() => preloadGenes.value, () => {
  if(controlSet.storeKey === 'genes') {
    selectedItems.value = preloadGenes.value
    appStore.updateFilter(controlSet.storeKey, preloadGenes.value)
  }
})

// watch(() => preloadTrait.value, () => {
//   if(controlSet.storeKey === 'phenotypes') {
//     selectedItems.value = preloadTrait.value
//     appStore.updateFilter(controlSet.storeKey, preloadTrait.value)
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
const onGenesPaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text')
  // console.log('Pasted data:', pastedData)
  appStore[PAGE_NAMES.SEARCH].pastedGenes = pastedData
}

const onModelChanged = (newValue) => {
  appStore.updateFilter(controlSet.storeKey, newValue)
}

// *** Utility functions *******************************************************
const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

const populateControlSelectList = () => {
  selectListItems.value = appStore.filterPanelControls[controlSet.storeKey]
}

const populateControlData = () => {
  const parentKey = appStore.currentPageName
  selectedItems.value = appStore[parentKey].filters[controlSet.storeKey]
}

// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
