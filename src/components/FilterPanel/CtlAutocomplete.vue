<template>
  <h3 v-html="controlSet.title"></h3>
  <v-autocomplete
    :items="selectListItems"
    :custom-filter="mlc"
    :placeholder="controlSet.placeholder"
    v-model="selectedItems"
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
import { watch, ref, inject, onMounted } from 'vue'
import { matchLowercase } from '@/util/util'
import { useFilterStore } from '@/stores/FilterStore';
import router from '@/router'
import { pageStoreDataMap } from '@/constants'

const filterStore = useFilterStore();

const { controlSet } = defineProps({
  controlSet: {}
})

const modelChanged = (newValue) => {
  filterStore.updateFilters(controlSet.storeKey, newValue)
}

const selectedItems = ref([])

const resetInput = inject('resetInput')

watch(() => resetInput.value, () => {
  selectedItems.value = controlSet.defaultValue
  filterStore.updateFilters(controlSet.storeKey, controlSet.defaultValue)
})

const loadFPControls = inject('loadFPControls')

watch(() => loadFPControls.value, (newValue, oldValue) => {
  populateControlSelectList()
})

const selectListItems = ref([]);

const populateControlSelectList = () => {
  selectListItems.value = filterStore.staticData[controlSet.storeKey]
}

const populateControlData = () => {
  const route = router.currentRoute.value
  const routeName = route.name
  const parentKey = pageStoreDataMap[routeName]
  selectedItems.value = filterStore[parentKey].filters[controlSet.storeKey]
}

onMounted(() => {
  populateControlSelectList()
  populateControlData()
})

const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

</script>

<style scoped>
/*h2 { font-size: 1.1rem; }*/
</style>
