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
import { useAppStore } from '@/stores/AppStore'

// *** Composables *************************************************************
const appStore = useAppStore()

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
watch(resetInput, async () => {
  inputValue.value = controlSet.defaultValue
  await appStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

// *** Lifecycle hooks *********************************************************
onMounted(() =>{
  populateControlData()
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const validateDebouncedInput = async (newValue) => {
  const rule = controlSet.rules[0] // assumption: there is only one rule
  // need explicit comparison to true, as the rule returns a string, the error message, which is truthy, if invalid input
  if (rule(newValue) === true) {
    await appStore.updateFilter(controlSet.storeKey, newValue)
  } else {
    // do nothing, error message is displayed by the control
  }
}

const deBouncer = debounce(validateDebouncedInput, DEBOUNCE_DELAY)

const populateControlData = () => {
  const parentKey = appStore.currentPageName
  inputValue.value = appStore[parentKey].filters[controlSet.storeKey]
}

const trapEmpty = async (focused) => {
  const ev = controlSet.emptyValue
  if(!focused && inputValue && inputValue.value.length === 0 ) {
    inputValue.value = ev
    await appStore.updateFilter(controlSet.storeKey, ev)
  }
}
</script>

// *** Configuration data ******************************************************
<style scoped>
</style>
