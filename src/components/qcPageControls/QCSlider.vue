<template>
  <v-container class="ml-2 mt-n2">
    <v-row>
      <h3>{{ controlText }}</h3>
    </v-row>

    <v-row>
      <v-slider
        :min="0"
        :max="1.0"
        :step="0.05"
        :max-width="controlSet.width"

        v-model="qcStore[controlSet.dataKey]"
        @end="onSliderUpdate"

        show-ticks="always"
        thumb-size="14"
      ></v-slider>
    </v-row>
  </v-container>
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const controlText = ref(`${controlSet.caption} (${controlSet.defaultValue})`)
const resetSlider = inject('resetSlider')

const onSliderUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.dataKey, newValue)
  controlText.value = `${controlSet.caption} (${newValue})`
}

watch(() => resetSlider.value, () => {
  controlText.value = `${controlSet.caption} (${controlSet.defaultValue})`
  qcStore.updateQCStoreKey(controlSet.dataKey, controlSet.defaultValue)
})
</script>

<style scoped>
</style>
