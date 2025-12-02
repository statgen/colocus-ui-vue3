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
  >
    <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title>
            {{ selectedItems.length >= controlSet.limit 
              ? `Maximum of ${controlSet.limit} items selected` 
              : 'No data available' }}
          </v-list-item-title>
        </v-list-item>
      </template>
  </v-autocomplete>
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
watch(() => resetInput.value, async () => {
  selectedItems.value = controlSet.defaultValue
  await appStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

watch(() => preloadGenes.value, async () => {
  if(controlSet.storeKey === 'genes') {
    selectedItems.value = preloadGenes.value
    await appStore.updateFilter(controlSet.storeKey, preloadGenes.value)
  }
})

// watch(() => preloadTrait.value, async () => {
//   if(controlSet.storeKey === 'phenotypes') {
//     selectedItems.value = preloadTrait.value
//     await appStore.updateFilter(controlSet.storeKey, preloadTrait.value)
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

const onModelChanged = async (newValue) => {
  if (controlSet.limit && newValue.length > controlSet.limit) {
    // Enforce limit
    newValue = newValue.slice(0, controlSet.limit)
  }
  await appStore.updateFilter(controlSet.storeKey, newValue)
  populateControlSelectList()
}

// *** Utility functions *******************************************************
const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

const populateControlSelectList = () => {
  if (controlSet.limit && selectedItems.value.length >= controlSet.limit) {
    selectListItems.value = []
    return
  }

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
