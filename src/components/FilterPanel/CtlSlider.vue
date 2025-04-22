<template>
  <h3>{{ controlLabel }}</h3>
  <v-slider
    v-model="inputValue"
    :min="0"
    :max="1"
    :step="0.05"
    show-ticks="always"
    thumb-size="14"
  />
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { debounce } from 'lodash'
import { useAppStore } from '@/stores/AppStore'

const { controlSet } = defineProps({ controlSet: {} })
const appStore = useAppStore()

const DEBOUNCE_DELAY = 500

const inputValue = ref(controlSet.defaultValue)
const controlLabel = ref(`${controlSet.title} (${inputValue.value})`)
const resetInput = inject('resetInput')

const debouncedUpdate = debounce(val => {
  appStore.updateFilter(controlSet.storeKey, val)
}, DEBOUNCE_DELAY)

watch(inputValue, newVal => {
  controlLabel.value = `${controlSet.title} (${newVal})`
  debouncedUpdate(newVal)
})

watch(() => resetInput.value, () => {
  inputValue.value = controlSet.defaultValue
})

</script>

<style scoped>
</style>
