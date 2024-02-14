<template>
  <h2 v-html="propSet.title"></h2>
  <v-autocomplete
    :items="propSet.items"
    :custom-filter="mlc"
    :placeholder="propSet.placeholder"
    @update:model-value="modelChanged"

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
import { onMounted } from 'vue'
import { matchLowercase } from '@/util/util'
import { useFilterStore } from '@/stores/FilterStore';

const { propSet } = defineProps({
  propSet: {}
})

const store = useFilterStore();

const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

const modelChanged = (newValue) => {
  store.updateFilters({ [propSet.storeKey]: newValue })
}

onMounted(() => {
  // console.log('propSet:', propSet)
})

</script>

<style scoped>
h2 { font-size: 1.1rem; }
</style>
