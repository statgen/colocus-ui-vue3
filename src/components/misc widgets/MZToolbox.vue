<template>
  <FilterPanelSubpanel title="Multi Zoom Tools" :resetButton="false" id="subPanelMZToolbox" class="pb-4">
    <v-select
      v-model="appStore[multizoomPage].selectedTheme"
      :items="themes"
      style="max-width: 200px"
      @update:model-value="onSelectTheme"
      label="Select theme"
      variant="outlined"
      hide-details
      density="compact"
    ></v-select>
    <v-btn @click="onUnmountAllPlots" size="small" class="btn-class my-3">Clear all plots</v-btn>
    <v-btn @click="onBlinkButtonClick" size="small" class="btn-class my-3">Blink all lead variants (5 sec)</v-btn>
    <v-btn @click="onExportAllClick" size="small" class="btn-class my-3">Export all plots</v-btn>
    <v-switch
      label="Recombination lines"
      v-model="showAllRecomb"
      @update:model-value="onToggleAllRecomb"
      density="compact"
      class="my-n1"
      color="clcAction"/>
    <v-switch
      label="Genetic significance lines"
      v-model="showAllGenSig"
      @update:model-value="onToggleAllGenSig"
      density="compact"
      class="my-n7"
      color="clcAction"/>
  </FilterPanelSubpanel>
</template>

<script setup>
// *** Imports *****************************************************************
import { ref } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { usePlotManager } from '@/composables/LZ2RegionPlotManager'
import FilterPanelSubpanel from "@/components/FilterPanel/FilterPanelSubpanel.vue";

// *** Composables *************************************************************
const appStore = useAppStore()
const plotManager = usePlotManager()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const BLINK_TIME = 5
const multizoomPage = PAGE_NAMES.MULTIZOOM
const showAllGenSig = ref(true)
const showAllRecomb = ref(true)
const themes = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onBlinkButtonClick = () => {
  document.querySelectorAll('.lead-variant')
    .forEach(el => {el?.classList.add('blink')})
  setTimeout(() => {
    document.querySelectorAll('.lead-variant')
      .forEach(el => {el?.classList.remove('blink')})
  }, BLINK_TIME * 1000)
}

const onExportAllClick = () => {
  exportPlotContainer('plotsContainer')
}

const onSelectTheme = (newValue) => {
  appStore[multizoomPage].selectedTheme = newValue
}

const onToggleAllGenSig = (val) => {
  appStore[multizoomPage].showGenSigLines = val
  updateAllPlots('showGenSigLine', val)
}

const onToggleAllRecomb = (val) => {
  appStore[multizoomPage].showRecombLines = val
  updateAllPlots('showRecombLine', val)
}

const onUnmountAllPlots = () => {
  plotManager.unmountAllPlots()
}

// *** Utility functions *******************************************************
function exportPlotContainer(el) {
  const element = document.getElementById(el);

  html2canvas(element, {
    useCORS: true,
    scale: 2, // Higher resolution
    backgroundColor: '#ffffff'
  }).then(canvas => {
    // Download the image
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genetic-plots.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  });
}

const updateAllPlots = (key, val) => {
  Object.keys(appStore[multizoomPage].plotSettings).forEach(k => {
    appStore[multizoomPage].plotSettings[k][key] = val
  })
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.btn-class {
  display: block;
}
</style>
