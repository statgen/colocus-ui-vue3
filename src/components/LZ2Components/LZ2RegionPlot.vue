<template>
    <div ref="plotContainer" class="plot-container" :style="{ backgroundColor: plotBackgroundColor }"/>
</template>

<script setup>
// *** Imports *****************************************************************
import { defineEmits, nextTick, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import * as d3 from 'd3v7'
import { useLZ2TooltipStore } from '@/stores/LZ2TooltipStore'
import { makePlotTitle, parseVariant2 } from '@/util/util'
import { LZ2_DISPLAY_OPTIONS, REF_BUILD, REF_BUILD_PORTAL } from '@/constants'
import { useLZ2Containers } from '@/composables/LZ2Containers'
import { useLZ2Scales } from '@/composables/LZ2Scales'
import { useLZ2DataLoaders  } from '@/composables/LZ2DataLoaders'
import { useLZ2Axes  } from '@/composables/LZ2Axes'
import { useLZ2Renderers } from '@/composables/LZ2Renderers'
import { useAppStore } from '@/stores/AppStore'
import {PAGE_NAMES} from "@/constants";

// *** Composables *************************************************************
const appStore = useAppStore()
const tooltipStore = useLZ2TooltipStore()

const LZ2Containers = useLZ2Containers()
const LZ2Scales = useLZ2Scales()
const LZ2DataLoaders = useLZ2DataLoaders()
const LZ2Axes = useLZ2Axes()
const LZ2Renderers = useLZ2Renderers()

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

const emit = defineEmits(['action-menu-click'])

// *** Props *******************************************************************
const props = defineProps({
  ID: Number,
  signal: Object,
  theme: String,
})

// *** Variables ***************************************************************
const variant = props.signal.lead_variant.vid
const parsedVariant = parseVariant2(variant)
const chromosome = parsedVariant.chr
const title = ref('')
const titleColor = ref('')

const plotContainer = useTemplateRef('plotContainer')
const rootSVG = ref(null)

const signalData = ref(null)
const recombData = ref(null)

const DIMENSIONS = LZ2_DISPLAY_OPTIONS.DIMENSIONS

const plotBackgroundColor = LZ2_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(
  [
      () => signalData.value,
      () => recombData.value,
      () => appStore[PAGE_NAMES.MULTIZOOM].plotSettings[props.ID]?.showRecombLine,
      () => appStore[PAGE_NAMES.MULTIZOOM].plotSettings[props.ID]?.showGenSigLine,
    ],
async ([signal, recomb, showRecomb, showGenSig]) => {
      if (!Array.isArray(signal) || !Array.isArray(recomb) || !plotContainer.value) return
      plotContainer.value.querySelectorAll('.recomb-group').forEach(n => {
        n.classList.toggle('hidden', !showRecomb)       // for screen
        n.setAttribute('display', showRecomb ? null : 'none') // for export
        n.style.display = showRecomb ? '' : 'none'            // for export
      })
      plotContainer.value.querySelectorAll('.gensig-group').forEach(n => {
        n.classList.toggle('hidden', !showGenSig)       // for screen
        n.setAttribute('display', showGenSig ? null : 'none') // for export
        n.style.display = showGenSig ? '' : 'none'            // for export
      })
      // await nextTick()
      renderPlot(signal, recomb)
    },
  { immediate: true }
)

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(() => {
  d3.select(plotContainer.value).selectAll('*').remove()
})

onMounted(async () => {
  const [t, c] = makePlotTitle(props.signal)
  title.value = t
  titleColor.value = c

  signalData.value = await LZ2DataLoaders.loadSignalData(props.signal, parsedVariant, REF_BUILD)
  recombData.value = await LZ2DataLoaders.loadRecombData(parsedVariant, REF_BUILD_PORTAL)
})

// *** Event handlers **********************************************************
const onActionMenuClick = (event) => {
  emit('action-menu-click', {plotID: props.ID, event})
}

// *** Utility functions *******************************************************
const renderPlot = (signalData, recombData) => {
  const showingRecombLine = appStore[PAGE_NAMES.MULTIZOOM].plotSettings[props.ID].showRecombLine
  const showingGenSigLine = appStore[PAGE_NAMES.MULTIZOOM].plotSettings[props.ID].showGenSigLine

  if(showingRecombLine) {
    DIMENSIONS.ctrWidth = DIMENSIONS.width
      - DIMENSIONS.margins.left
      - DIMENSIONS.margins.right
  } else {
    DIMENSIONS.ctrWidth = LZ2_DISPLAY_OPTIONS.DIMENSIONS.width
      - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.left
      - 10
      // - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.right
  }

  d3.select(plotContainer.value).selectAll('*').remove()

  rootSVG.value = LZ2Containers.createSVG(plotContainer.value, DIMENSIONS, plotBackgroundColor.value)
  LZ2Renderers.renderBorder(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_BORDER_COLOR)
  LZ2Renderers.renderHeader(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_HEADER_COLOR, props.signal.lead_variant.vid, title.value, titleColor.value, onActionMenuClick)

  const thePlot = LZ2Containers.createPlotContainer(rootSVG.value, DIMENSIONS)

  const xAccessor = d => d.x
  const yAccessor = d => d.y

  const xScale = LZ2Scales.createXscale(xAccessor, signalData, DIMENSIONS)
  const yScaleSignal = LZ2Scales.createYscaleSignal(yAccessor, signalData, DIMENSIONS)
  const yScaleRecomb = LZ2Scales.createYscaleRecomb(DIMENSIONS)

  LZ2Axes.renderXaxis(thePlot, xScale, DIMENSIONS, chromosome)
  LZ2Axes.renderYaxisSignal(thePlot, yScaleSignal, DIMENSIONS)
  if(showingRecombLine) LZ2Axes.renderYaxisRecomb(thePlot, yScaleRecomb, DIMENSIONS)

  const clipID = `plot-area-clip-${props.ID}`
  LZ2Renderers.renderPlotClipPath(rootSVG, clipID, DIMENSIONS, LZ2_DISPLAY_OPTIONS.DIAMOND_MARGIN)
  const plotGroup = thePlot.append('g').attr('clip-path', `url(#${clipID})`)

  LZ2Renderers.renderSignalData(plotGroup, signalData, xScale, yScaleSignal, xAccessor, yAccessor, tooltipCallbacks, props.theme)
  if(showingRecombLine) LZ2Renderers.renderRecombLine(plotGroup, recombData, xScale, yScaleRecomb)
  if(showingGenSigLine) LZ2Renderers.renderGenSigLine(plotGroup, xScale, yScaleSignal)
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.plot-container {
  margin-right: 1rem;
  margin-top: 0;
}

:deep(.recomb-group.hidden) {
  display: none;
}
</style>
