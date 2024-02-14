<template>
  <h2 v-html="propSet.title"></h2>
  <v-text-field
    @update:model-value="deBouncer"
    @update:focused="trapEmpty"
    :placeholder="propSet.placeholder"
    :rules="propSet.rules"
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
import { defineProps, ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { useFilterStore } from '@/stores/FilterStore';

const inputValue = ref('')

const filterStore = useFilterStore();

const DEBOUNCE_DELAY = 500

const { propSet } = defineProps({
  propSet: {}
})

const validateDebouncedInput = (newValue) => {
  const rule = propSet.rules[0] // assumption: there is only one rule
  // need explicit comparison to true, as the rule returns a string, the error message, which is truthy, if invalid input
  if (rule(newValue) === true) {
    filterStore.updateFilters({ [propSet.storeKey]: newValue });
  } else {
    // do nothing, error message is displayed by the control
  }
}

const deBouncer = debounce(validateDebouncedInput, DEBOUNCE_DELAY)

onMounted(() =>{
  // set default value from filterStore on load
  const defaultValue = filterStore.getFilterValue(propSet.storeKey);
  if (defaultValue !== undefined) {
    inputValue.value = defaultValue;
  }
})

const trapEmpty = (focused) => {
  const dv = propSet.defValue
  if(!focused && inputValue.value.length === 0 && dv.length > 0 ) {
    inputValue.value = dv
    filterStore.updateFilters({ [propSet.storeKey]: dv })
  }
}
</script>

<style scoped>
h2 { font-size: 1.1rem; }
</style>
