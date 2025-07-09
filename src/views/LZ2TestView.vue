<template>
  <DefaultLayout>
    <h1>LocusZoom plotter v2 test page</h1>
    <v-select
      v-model="selectedVariant"
      :items="testData"
      item-title="variant"
      item-value="signal"
      return-object
      single-line
      width="300"
      @update:modelValue="onSelectVariant"
      label="Select variant to plot"
      variant="outlined"
    ></v-select>
    <div ref="plotContainer" class="plot-container mt-4"></div>
  </DefaultLayout>
</template>

<script setup>
import { onBeforeUnmount, ref, useTemplateRef } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { usePlotManager } from '@/composables/D3RPPlotManager'

const { mountPlot, clearAllPlots } = usePlotManager()

const plotContainer = useTemplateRef('plotContainer')
const selectedVariant = ref()

const testData = [
  { variant:'3_33457493_C_A', signal: 'WLMxNbszTbHrtf2X3FqRu9'},
  { variant:'3_33457493_C_A', signal: 'Y7was11zaKDGC2LdxouRsL'},
  { variant:'2_121310269_A_C', signal: 'SuRGPY5RpQ9Rr9kdg3XdbG'},
  { variant:'2_121310269_A_C', signal: '5juihxSC8XWtQ1bqgjfZqZ'},
  { variant:'4_154191226_G_A', signal: 'QwiPuqumS4kaWdgPM3g3Hj'},
  { variant:'4_154191226_G_A', signal: '4YXv6oX83vVxnsARnY9qwm'},
  { variant:'3_119818585_G_C', signal: '7vFUBkShuKxdY91APzC9bJ'},
  { variant:'3_119813282_A_G', signal: 'MhbYBj7DMhsr71MG9J62dS'},
  { variant:'11_62200269_A_T', signal: '6r2LoamTfQNFKaahEFPT4A'},
  { variant:'11_62200176_C_T', signal: '7UVfykntk2QLPZqSrnmCaL'},
]

onBeforeUnmount(() => {
  clearAllPlots()
})

const onSelectVariant = (v) => {
  mountPlot({
    plotContainer,
    variant: v.variant,
    signal: v.signal,
    type: 'region',
    // chartClass: '',
    // chartStyle: {}
  })
}
</script>

<style scoped>
.plot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}
</style>
