<template>
  <DefaultLayout>
    <h1>LocusZoom plotter v2 test page</h1>
    <div class="d-flex align-center flex-wrap ga-2 mt-2">
      <v-select
        v-model="selectedTheme"
        :items="themes"
        style="max-width: 200px"
        @update:model-value="onSelectTheme"
        label="Select theme"
        variant="outlined"
        hide-details
        density="compact"
      ></v-select>
      <v-select
        v-model="selectedVariant"
        :items="testData"
        item-title="variant"
        item-value="signal"
        return-object
        style="max-width: 225px"
        @update:modelValue="onSelectVariant"
        label="Select variant to plot"
        variant="outlined"
        hide-details
        density="compact"
      ></v-select>
      <v-btn @click="onPlotSelected">Plot selected</v-btn>
      <v-btn @click="onAddAllPlots">Plot all</v-btn>
      <v-btn @click="clearAllPlots">Clear all</v-btn>
    </div>
    <LZTooltip />
    <div ref="plotContainer" class="plot-container mt-4"></div>
  </DefaultLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { usePlotManager } from '@/composables/LZRegionPlotManager'
import { LZ_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'

const themes = Object.keys(LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES)

const { mountPlot, clearAllPlots } = usePlotManager()

const plotContainer = useTemplateRef('plotContainer')
const selectedTheme = ref()
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

onMounted(async () => {
  selectedVariant.value = testData[0]
  selectedTheme.value = Object.keys(LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES)[1]
})

onBeforeUnmount(() => {
  clearAllPlots()
})

const onSelectTheme = (newValue) => {
  selectedTheme.value = newValue
}

const onSelectVariant = async (vs) => {
  selectedVariant.value = vs
}

const renderPlot = async(vs, theme) => {
  await mountPlot({
    plotContainer,
    variant: vs.variant,
    signal: vs.signal,
    type: 'region',
    theme,
  })
}

const onPlotSelected = async () => {
  await renderPlot(selectedVariant.value, selectedTheme.value)
}

const onAddAllPlots = async (vs) => {
  for(let i=0; i<testData.length; i++){
    await renderPlot(testData[i], selectedTheme.value)
  }
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
