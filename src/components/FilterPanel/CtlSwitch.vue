<template>
  <div class="ml-2 mb-n4 pa-0">
    <v-switch
      :label="controlSet.title"
      @update:model-value="modelChanged"
      v-model="controlValue"
      density="compact"
    />
  </div>
</template>

<script setup>
import { inject, onMounted, ref, watch } from 'vue'
import { useFilterStore } from '@/stores/FilterStore';
import router from '@/router'
import { pageStoreDataMap } from '@/constants'

const filterStore = useFilterStore();

const controlValue = ref(false)

const { controlSet } = defineProps({
  controlSet: {}
})

const resetInput = inject('resetInput')

watch(resetInput, () => {
  controlValue.value = controlSet.defaultValue
  filterStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
})

const modelChanged = (newValue) => {
  filterStore.updateFilter(controlSet.storeKey, newValue)
}

const populateControlData = () => {
  const route = router.currentRoute.value
  const routeName = route.name
  const parentKey = pageStoreDataMap[routeName]
  controlValue.value = filterStore[parentKey].filters[controlSet.storeKey]
}

onMounted(() => {
  populateControlData()
})

</script>

<style scoped>
</style>
