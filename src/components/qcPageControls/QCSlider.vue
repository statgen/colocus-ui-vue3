<template>
  <span class="text-caption">
    {{ controlSet.caption }} {{ controlValue }}
  </span>

  <v-slider
    @end="onSliderUpdate"
    v-model="controlValue"
    :min="0"
    :max="1.0"
    :step="0.05"
    :width="controlSet.width"
    show-ticks="always"
    thumb-size="14"
  ></v-slider>
</template>

<script setup>
import { ref } from 'vue'
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const controlValue = ref(controlSet.defaultValue)

const { controlSet } = defineProps({
  controlSet: {}
})

const onSliderUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.dataKey, newValue)
}
</script>

<style scoped>
</style>
