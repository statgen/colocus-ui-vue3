<template>
  <FilterPanelSubpanel title="Multizoom Tools" :resetButton="false" id="subPanelMZToolbox" class="pb-4">
    <h3 class="mb-n2">Actions</h3>
    <v-btn @click="onBlinkButtonClick" size="small" class="btn-class my-3">Blink all lead variants (5 sec)</v-btn>
    <v-btn @click="onUnmountAllPlots" size="small" class="btn-class my-3">Delete all plots</v-btn>
    <v-btn @click="onExportAllClick" size="small" class="btn-class my-3">Export plot group</v-btn>

    <h3 class="mb-n2">Y axis</h3>
    <v-radio-group v-model="yAxis" @update:model-value="onYAxisChange" inline>
      <v-radio label="Conditional" value="conditional" color="clcAction"></v-radio>
      <v-radio label="Marginal" value="marginal" color="clcAction"></v-radio>
    </v-radio-group>

    <h3 class="mb-0 mt-n4">LD reference</h3>
    <v-radio-group v-model="selectedRef" color="clcAction">
      <v-radio v-for="variant in uniqueVariants" :key="variant" :value="variant" color="clcAction" density="compact">
        <template #label>
          <span :style="{ color: colorHasher.hex(variant) }">
            {{ formatVariantString(variant) }}
          </span>
        </template>
      </v-radio>
    </v-radio-group>

    <h3 class="mt-n2">View</h3>
    <v-switch
      label="Add unique signals only"
      v-model="appStore[multizoomPage].addUniqueRefsOnly"
      density="compact"
      class="my-n1"
      color="clcAction"/>
    <v-switch
      label="Show recombination lines"
      v-model="showAllRecomb"
      @update:model-value="onToggleAllRecomb"
      density="compact"
      class="my-n7"
      color="clcAction"/>
    <v-switch
      label="Show genetic significance lines"
      v-model="showAllGenSig"
      @update:model-value="onToggleAllGenSig"
      density="compact"
      class="my-n7"
      color="clcAction"/>
    <v-select
      v-model="appStore[multizoomPage].selectedTheme"
      :items="themes"
      style="max-width: 200px"
      @update:model-value="onSelectTheme"
      class="mt-4"
      label="Select theme"
      variant="outlined"
      hide-details
      density="compact"
    ></v-select>
  </FilterPanelSubpanel>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { usePlotManager } from '@/composables/LZ2RegionPlotManager'
import FilterPanelSubpanel from "@/components/FilterPanel/FilterPanelSubpanel.vue"
import { colorHasher, formatVariantString } from '@/util/util'

// *** Composables *************************************************************
const appStore = useAppStore()
const plotManager = usePlotManager()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const addUniqueRefsOnly = ref(false)
const BLINK_TIME = 5
const multizoomPage = PAGE_NAMES.MULTIZOOM
const showAllGenSig = ref(true)
const showAllRecomb = ref(true)
const themes = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)
const yAxis = ref(LZ2_DISPLAY_OPTIONS.DEFAULT_Y_AXIS)

// *** Computed ****************************************************************
const selectedRef = computed({
  get: () => appStore[multizoomPage].selectedLDRef,
  set: (v) => { appStore[multizoomPage].selectedLDRef = v }
})

const uniqueVariants = computed(() => {
  const variants = Object.values(appStore[multizoomPage].plotSettings).map(v => v.variant)
  return [...new Set(variants)].sort()
})

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
  const MZPage = appStore[multizoomPage]
  MZPage.plotSettings = {}
  MZPage.rowSlotToPlotID = {}
}

const onYAxisChange = (val) => {
  appStore[multizoomPage].yAxis = val
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
