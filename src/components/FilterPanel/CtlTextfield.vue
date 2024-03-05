<template>
  <h2 v-html="controlSet.title"></h2>
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
import { ref, inject, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { useFilterStore } from '@/stores/FilterStore';
import router from '@/router'
import { pageStoreDataMap } from '@/constants'

const filterStore = useFilterStore();

const inputValue = ref('')

const resetInput = inject('resetInput')

watch(resetInput, () => {
  inputValue.value = controlSet.defaultValue
  filterStore.updateFilters(controlSet.storeKey, controlSet.defaultValue)
})

const DEBOUNCE_DELAY = 500

const { controlSet } = defineProps({
  controlSet: {}
})

const validateDebouncedInput = (newValue) => {
  const rule = controlSet.rules[0] // assumption: there is only one rule
  // need explicit comparison to true, as the rule returns a string, the error message, which is truthy, if invalid input
  if (rule(newValue) === true) {
    filterStore.updateFilters(controlSet.storeKey, newValue)
  } else {
    // do nothing, error message is displayed by the control
  }
}

const deBouncer = debounce(validateDebouncedInput, DEBOUNCE_DELAY)

const populateControlData = () => {
  const route = router.currentRoute.value
  const routeName = route.name
  const parentKey = pageStoreDataMap[routeName]
  inputValue.value = filterStore[parentKey].filters[controlSet.storeKey]
}

onMounted(() =>{
  populateControlData()
})

const trapEmpty = (focused) => {
  const ev = controlSet.emptyValue
  if(!focused && inputValue.value.length === 0 ) {
    inputValue.value = ev
    filterStore.updateFilters(controlSet.storeKey, ev)
  }
}
</script>

<style scoped>
h2 { font-size: 1.1rem; }
</style>
