<template>
  <h3>{{ controlLabel }}</h3>
  <v-slider
    @end="onSliderChangeEnd"
    @update:modelValue="onSliderChange"
    v-model="inputValue"
    :disabled="!enabled"
    :min="0"
    :max="1"
    :step="0.05"
    show-ticks="always"
    thumb-size="14"
  />
</template>

<script setup>
import {computed, inject, ref, watch} from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useQCStore } from '@/stores/QCStore'
import { PAGE_NAMES } from '@/constants'

const { controlSet } = defineProps({ controlSet: {} })
const appStore = useAppStore()
const qcStore = useQCStore()

const genePage = PAGE_NAMES.GENE

const inputValue = ref(controlSet.defaultValue)
const controlLabel = ref(`${controlSet.title} ${inputValue.value}`)

const enabled = computed(() => {
  return appStore.slidersEnabled
})

const resetInput = inject('resetInput')

const onSliderChange = (val) => {
  controlLabel.value = `${controlSet.title} ${val}`
}

const onSliderChangeEnd = async (val) => {
  controlLabel.value = `${controlSet.title} ${val}`

  if(controlSet.topKey === 'filter') {
    await appStore.updateFilter(controlSet.storeKey, val)

  } else if(controlSet.topKey === 'gene') {
    appStore[genePage][controlSet.storeKey] = val

  } else if(controlSet.topKey === 'qcStats') {
    qcStore.updateQCStoreKey(controlSet.storeKey, val)

  } else console.error('Invalid store specified to slider control')
}

watch(() => resetInput.value, () => {
  const cpn = appStore.currentPageName
  inputValue.value = controlSet.defaultValue
  if(cpn === PAGE_NAMES.GENE) {
    appStore.clearPageData = !appStore.clearPageData
  } else { // assume search, lz, lz2, manhattan
    appStore.updateFilter(controlSet.storeKey, controlSet.defaultValue)
  }
})

watch(
  () => {
    // Same logic as onSliderChangeEnd to get the value from the store
    if (controlSet.topKey === 'filter') {
      return appStore[appStore.currentPageName]?.filters?.[controlSet.storeKey]
    }
    return appStore[appStore.currentPageName]?.[controlSet.storeKey]
  },
  (newValue) => {
    // Use inputValue (not controlValue) and check for undefined
    if (newValue !== undefined && newValue !== inputValue.value) {
      inputValue.value = newValue
      controlLabel.value = `${controlSet.title} ${newValue}`
    }
  }
)

</script>

<style scoped>
</style>
