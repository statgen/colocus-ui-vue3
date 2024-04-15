<template>
  <div class="ml-2 mb-n4 pa-0">
    <v-switch
      :label="controlSet.title"
      @update:model-value="onModelChanged"
      v-model="controlValue"
      density="compact"
    />
  </div>
</template>

<script setup>
import { inject, onMounted, ref, watch } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'
import { PAGE_STORE_DATA_MAP } from '@/constants'

const { controlSet } = defineProps({
  controlSet: {}
})

const filterStore = useFilterStore()
const controlValue = ref(false)

const resetInput = inject('resetInput')

watch(resetInput, () => {
  controlValue.value = controlSet.defaultValue
  filterStore.updateSwitch(controlSet.storeKey, controlSet.defaultValue)
})

onMounted(() => {
  populateControlData()
})

const onModelChanged = (newValue) => {
  filterStore.updateSwitch(controlSet.storeKey, newValue)
}

const populateControlData = () => {
  const parentKey = PAGE_STORE_DATA_MAP[filterStore.currentPageName]
  controlValue.value = filterStore[parentKey][controlSet.storeKey]
}

</script>

<style scoped>
</style>
