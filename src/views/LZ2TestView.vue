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
      <v-btn @click="unmountAllPlots">Clear all</v-btn>
      <v-btn @click="onBlinkButtonClick">Blink</v-btn>
    </div>
    <LZ2Tooltip />
    <LZ2ActionMenu
      v-if="showMenu"
      :menu-style="{
        position: 'absolute',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`
      }"
      @deletePlot="onDeletePlot"
      @toggleGenSigLine="onToggleGenSig"
      @toggleRecombLine="onToggleRecombLine"
      @exportPlot="onExportPlot"
      @closeMenu="showMenu = false"
    />
    <div ref="plotsContainer" class="plot-container mt-4"></div>
  </DefaultLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { usePlotManager } from '@/composables/LZ2RegionPlotManager'
import { LZ_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'

// *** Composables *************************************************************
const { mountPlot, unmountPlot, unmountAllPlots } = usePlotManager()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const themes = Object.keys(LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES)

const plotsContainer = useTemplateRef('plotsContainer')
const selectedTheme = ref()
const selectedVariant = ref()

const activePlotID = ref(0)
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const menuEl = ref(null)

const BLINK_TIME = 5

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  selectedVariant.value = testData[0]
  selectedTheme.value = Object.keys(LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES)[1]
})

onBeforeUnmount(() => {
  unMountAllPlots()
})

// *** Event handlers **********************************************************
const onSelectTheme = (newValue) => {
  selectedTheme.value = newValue
}

const onSelectVariant = async (vs) => {
  selectedVariant.value = vs
}

const onPlotSelected = async () => {
  await renderPlot(selectedVariant.value, selectedTheme.value)
}

const onAddAllPlots = async (vs) => {
  for(let i=0; i<testData.length; i++){
    await renderPlot(testData[i], selectedTheme.value)
  }
}

const onBlinkButtonClick = () => {
  document.querySelectorAll('.lead-variant')
    .forEach(el => {el?.classList.add('blink')})
  setTimeout(() => {
    document.querySelectorAll('.lead-variant')
      .forEach(el => {el?.classList.remove('blink')})
  }, BLINK_TIME * 1000)
}

const onActionMenuClick = async (arg) => {
  const rect = arg.event.target.getBoundingClientRect()
  activePlotID.value = arg.plotID

  // Temporarily place menu directly under the button
  menuPosition.value = { x: rect.left, y: rect.bottom }
  showMenu.value = false

  requestAnimationFrame(() => {
    showMenu.value = true
  })

  const menuWidth = menuEl.value?.offsetWidth || 160
  const spacing = 4

  // Now shift it left
  menuPosition.value = {
    x: rect.left - menuWidth - spacing,
    y: rect.bottom + spacing
  }
}

const onDeletePlot = () => {
  console.log('onDeletePlot:', activePlotID.value)
  unmountPlot(`plot_${activePlotID.value}`)
}
const onToggleRecombLine = () => {console.log('onToggleRecomb')}
const onToggleGenSig = () => {console.log('onToggleGenSig')}
const onExportPlot = () => {console.log('onExportPlot')}

// *** Utility functions *******************************************************
const renderPlot = async(vs, theme) => {
  await mountPlot({
    plotsContainer,
    variant: vs.variant,
    signal: vs.signal,
    type: 'region',
    theme,
    onActionMenuClick,
  })
}

// *** Configuration data ******************************************************
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

</script>

<style scoped>
.plot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}
</style>
