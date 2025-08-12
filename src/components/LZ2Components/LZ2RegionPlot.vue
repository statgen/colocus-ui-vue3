<template>
    <div ref="plotContainer" class="plot-container" :style="{ backgroundColor: plotBackgroundColor }"/>
</template>

<script setup>
// *** Imports *****************************************************************
import { defineEmits, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import * as d3 from 'd3v7'
import { useLZ2TooltipStore } from '@/stores/LZ2TooltipStore'
import { makePlotTitle, parseVariant2 } from '@/util/util'
import { LZ2_DISPLAY_OPTIONS, REF_BUILD, REF_BUILD_PORTAL } from '@/constants'
import { useLZ2Containers } from '@/composables/LZ2Containers'
import { useLZ2Scales } from '@/composables/LZ2Scales'
import { useLZ2DataLoaders  } from '@/composables/LZ2DataLoaders'
import { useLZ2Axes  } from '@/composables/LZ2Axes'
import { useLZ2Renders } from '@/composables/LZ2Renderers'

// *** Composables *************************************************************
const tooltipStore = useLZ2TooltipStore()
const LZ2Containers = useLZ2Containers()
const LZ2Scales = useLZ2Scales()
const LZ2DataLoaders = useLZ2DataLoaders()
const LZ2Axes = useLZ2Axes()
const LZ2Renders = useLZ2Renders()

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

const emit = defineEmits(['actionMenu-click'])

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
watch( // render when both signal and recomb data are ready
  () => [signalData.value, recombData.value],
  ([signalData, recombData]) => {
    if (signalData && recombData && plotContainer.value) renderPlot(signalData, recombData)
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
  emit('actionMenu-click', {plotID: props.ID, event})
}

// *** Utility functions *******************************************************
const renderPlot = (signalData, recombData) => {
  d3.select(plotContainer.value).selectAll('*').remove()

  rootSVG.value = LZ2Containers.createSVG(plotContainer.value, DIMENSIONS, plotBackgroundColor.value)
  LZ2Renders.renderBorder(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_BORDER_COLOR)
  LZ2Renders.renderHeader(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_HEADER_COLOR, props.signal.lead_variant.vid, title.value, titleColor.value, onActionMenuClick)

  const thePlot = LZ2Containers.createPlotContainer(rootSVG.value, DIMENSIONS)

  const xAccessor = d => d.x
  const yAccessor = d => d.y

  const xScale = LZ2Scales.createXscale(xAccessor, signalData, DIMENSIONS)
  const yScaleSignal = LZ2Scales.createYscaleSignal(yAccessor, signalData, DIMENSIONS)
  const yScaleRecomb = LZ2Scales.createYscaleRecomb(DIMENSIONS)

  LZ2Axes.renderXaxis(thePlot, xScale, DIMENSIONS, chromosome)
  LZ2Axes.renderYaxisSignal(thePlot, yScaleSignal, DIMENSIONS)
  LZ2Axes.renderYaxisRecomb(thePlot, yScaleRecomb, DIMENSIONS)

  const clipID = `plot-area-clip-${props.ID}`
  LZ2Renders.renderPlotClipPath(rootSVG, clipID, DIMENSIONS, LZ2_DISPLAY_OPTIONS.DIAMOND_MARGIN)
  const plotGroup = thePlot.append('g').attr('clip-path', `url(#${clipID})`)

  LZ2Renders.renderSignalData(plotGroup, signalData, xScale, yScaleSignal, xAccessor, yAccessor, tooltipCallbacks, props.theme)
  LZ2Renders.renderRecombLine(plotGroup, recombData, xScale, yScaleRecomb)
  LZ2Renders.renderGenSigLine(plotGroup, xScale, yScaleSignal)
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.plot-container {
  margin-right: 1rem;
  margin-top: 0;
}
</style>
