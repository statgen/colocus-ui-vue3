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

const onSliderChangeEnd = (val) => {
  controlLabel.value = `${controlSet.title} ${val}`

  if(controlSet.topKey === 'filter') {
    appStore.updateFilter(controlSet.storeKey, val)

  } else if(controlSet.topKey === 'gene') {
    appStore[genePage][controlSet.storeKey] = val

  } else if(controlSet.topKey === 'qcStats') {
    console.log('slider updating', controlSet.storeKey, val)
    qcStore.updateQCStoreKey(controlSet.storeKey, val)

  } else console.error('Invalid store specified to slider control')
}

watch(() => resetInput.value, () => {
  inputValue.value = controlSet.defaultValue
})

</script>

<style scoped>
</style>
