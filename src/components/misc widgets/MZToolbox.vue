<template>
  <FilterPanelSubpanel title="MultiZoom Tools" :resetButton="false" id="subPanelMZToolbox" class="pb-4">
    <h3 class="mb-n2">Actions</h3>
    <v-btn @click="onBlinkButtonClick" size="small" class="btn-class my-3">Blink all lead variants (5 sec)</v-btn>
    <v-btn @click="onUnmountAllPlots" size="small" class="btn-class my-3">Delete all plots</v-btn>
    <v-btn @click="onExportAllClick" size="small" class="btn-class my-3">Export plot group</v-btn>
    <v-btn @click="onTrimGrid" size="small" class="btn-class my-3">Trim grid</v-btn>

    <p class="mb-n2">{{ zoomSliderLabel }}</p>
    <v-slider
      @end="onSliderChangeEnd"
      v-model="zoomSlider"
      :min="25e3"
      :max="500e3"
      :step="25e3"
      class="mb-n4"
      max-width="225"
      show-ticks="always"
      thumb-size="14"
    />

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
      v-model="storeMZpage.addUniqueRefsOnly"
      density="compact"
      class="my-n1"
      color="clcAction"/>
    <v-switch
      label="Show crosshairs"
      v-model="storeMZpage.showCrosshair"
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
    <v-switch
      label="Show plot borders"
      v-model="storeMZpage.showPlotBorders"
      density="compact"
      class="my-n7"
      color="clcAction"/>
    <v-switch
      label="Show recombination lines"
      v-model="showAllRecomb"
      @update:model-value="onToggleAllRecomb"
      density="compact"
      class="my-n7"
      color="clcAction"/>
<!--    <v-switch-->
<!--      label="Show plot IDs"-->
<!--      v-model="showPlotID"-->
<!--      @update:model-value="onToggleShowPlotID"-->
<!--      density="compact"-->
<!--      class="my-n7"-->
<!--      color="clcAction"/>-->
    <v-select
      v-model="storeMZpage.selectedTheme"
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
import { computed, defineEmits, ref } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES, PLOT_REGION_DEFAULT } from '@/constants'
import FilterPanelSubpanel from "@/components/FilterPanel/FilterPanelSubpanel.vue"
import { colorHasher, formatVariantString } from '@/util/util'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'

// *** Composables *************************************************************
const appStore = useAppStore()
const mzGridHelpers = useMZGridHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const BLINK_TIME = 5
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const showAllGenSig = ref(true)
const showAllRecomb = ref(true)
const showPlotID = ref(false)
const themes = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)
const yAxis = ref(LZ2_DISPLAY_OPTIONS.DEFAULT_Y_AXIS)
const zoomSlider = ref(PLOT_REGION_DEFAULT)

// *** Computed ****************************************************************
const selectedRef = computed({
  get: () => storeMZpage.selectedLDRef,
  set: (v) => { storeMZpage.selectedLDRef = v }
})

const uniqueVariants = computed(() => {
  const variants = Object.values(storeMZpage.plotRegistry)
    .filter(plot => plot.variant)  // Skip plots without variants (e.g., gene panels)
    .map(plot => plot.variant)
  return [...new Set(variants)].sort()
})

const zoomSliderLabel = computed(() => {
  const x = zoomSlider.value / 1000
  return `Set plot region ±${x}k`
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['export-plot-group'])

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
  emit('export-plot-group')
}

const onSelectTheme = (newValue) => {
  storeMZpage.selectedTheme = newValue
}

const onSliderChangeEnd = async (val) => {
  const variant = storeMZpage.signal1Variant
  mzGridHelpers.setPlotRegion(variant, val)
  storeMZpage.zoomRegion = val
}

const onToggleAllGenSig = (val) => {
  storeMZpage.showGenSigLines = val
  updateAllPlots('showGenSigLine', val)
}

const onToggleAllRecomb = (val) => {
  storeMZpage.showRecombLines = val
  updateAllPlots('showRecombLine', val)
}

const onToggleShowPlotID = (val) => {
  storeMZpage.showPlotID = val
  updateAllPlots('showPlotID', val)
}

const onTrimGrid = () => {
  mzGridHelpers.trimGrid()
}

const onUnmountAllPlots = async () => {
  await mzGridHelpers.initializePlotSession()
}

const onYAxisChange = (val) => {
  storeMZpage.yAxis = val
}

const updateAllPlots = (key, val) => {
  Object.keys(storeMZpage.plotRegistry).forEach(k => {
    storeMZpage.plotRegistry[k][key] = val
  })
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.btn-class {
  display: block;
}
</style>
