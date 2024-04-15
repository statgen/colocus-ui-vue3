<template>
  <h3 v-html="controlSet.title"></h3>
  <v-text-field
    @update:model-value="deBouncer"
    @update:focused="trapEmpty"
    :placeholder="controlSet.placeholder"
    :rules="controlSet.rules"
    validate-on="input"
    v-model="inputValue"

    bg-color="white"
    class="mb-n1"
    density="compact"
    flat
    variant="outlined"
  />
</template>

<script setup>
// *** Imports *****************************************************************
import { inject, onMounted, ref, watch } from 'vue'
import { debounce } from 'lodash'
import { useFilterStore } from '@/stores/FilterStore'
import { PAGE_STORE_DATA_MAP } from '@/constants'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
const { controlSet } = defineProps({
  controlSet: {}
})

// *** Variables ***************************************************************
const DEBOUNCE_DELAY = 500
const inputValue = ref('')
const resetInput = inject('resetInput')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(resetInput, () => {
  inputValue.value = controlSet.defaultValue
  filterStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

// *** Lifecycle hooks *********************************************************
onMounted(() =>{
  populateControlData()
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const validateDebouncedInput = (newValue) => {
  const rule = controlSet.rules[0] // assumption: there is only one rule
  // need explicit comparison to true, as the rule returns a string, the error message, which is truthy, if invalid input
  if (rule(newValue) === true) {
    filterStore.updateFilter(controlSet.storeKey, newValue)
  } else {
    // do nothing, error message is displayed by the control
  }
}

const deBouncer = debounce(validateDebouncedInput, DEBOUNCE_DELAY)

const populateControlData = () => {
  const parentKey = PAGE_STORE_DATA_MAP[filterStore.currentPageName]
  inputValue.value = filterStore[parentKey].filters[controlSet.storeKey]
}

const trapEmpty = (focused) => {
  const ev = controlSet.emptyValue
  if(!focused && inputValue && inputValue.value.length === 0 ) {
    inputValue.value = ev
    filterStore.updateFilter(controlSet.storeKey, ev)
  }
}
</script>

// *** Configuration data ******************************************************
<style scoped>
</style>
