<template>
  <div class="ml-2 mb-n4 pa-0">
    <v-switch
      :label="controlSet.title"
      @update:model-value="onModelChanged"
      v-model="controlValue"
      density="compact"
      color="clcAction"
    />
  </div>
</template>

<script setup>
import { inject, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'

const { controlSet } = defineProps({
  controlSet: {}
})

const appStore = useAppStore()

const getStoreValue = () => {
  const parentKey = appStore.currentPageName
  return appStore[parentKey]?.[controlSet.storeKey]
}

const controlValue = ref(getStoreValue() ?? controlSet.defaultValue ?? false)

const resetInput = inject('resetInput')

watch(resetInput, () => {
  controlValue.value = controlSet.defaultValue
  appStore.updateSwitch(controlSet.storeKey, controlSet.defaultValue)
})

watch(getStoreValue, (newValue) => {
  if (newValue !== undefined && newValue !== controlValue.value) {
    controlValue.value = newValue
  }
})

onMounted(() => {
  populateControlData()
})

const onModelChanged = (newValue) => {
  appStore.updateSwitch(controlSet.storeKey, newValue)
}

const populateControlData = () => {
  const parentKey = appStore.currentPageName
  controlValue.value = appStore[parentKey][controlSet.storeKey]
}

</script>

<style scoped>
</style>
