<template>
  <h3>{{ h4label }}</h3>
  <v-slider
    @end="onh4SliderUpdate"
    :disabled="!enabled"
    :min="0"
    :max="1.0"
    :step="0.1"
    v-model="h4value"
    show-ticks="always"
    thumb-size="12"
  ></v-slider>
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

const appStore = useAppStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const genePage = PAGE_NAMES.GENE
const enabled = ref(false)

const h4value = ref(controlSet.defaultValue)
const h4label = ref(`${controlSet.title} ${controlSet.defaultValue}`)

const resetInput = inject('resetInput')

watch(() => resetInput.value, () => {
  h4value.value = controlSet.defaultValue
  onh4SliderUpdate(controlSet.defaultValue)
})

watch(() => appStore[genePage][controlSet.enableKey], newValue => {
  enabled.value = newValue
})

const onh4SliderUpdate = (val) => {
  appStore[genePage][controlSet.storeKey] = val
  h4label.value = `${controlSet.title} ${val}`
}
</script>

<style scoped>
</style>
