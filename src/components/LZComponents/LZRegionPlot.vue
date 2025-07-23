<template>
    <div ref="plotContainer" class="plot-container" :style="{ backgroundColor: plotBackgroundColor }"/>
</template>

<script setup>
// *** Imports *****************************************************************
import { defineEmits, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import * as d3 from 'd3v7'
import { useLZTooltipStore } from '@/stores/LZTooltipStore'
import {
  createPlotContainer, createSVG, createXscale, createYscaleSignal, createYscaleRecomb,
  renderXaxis, renderYaxisRecomb, renderYaxisSignal, renderSignalData, renderGenSigLine, renderRecombLine,
  loadRecombData, loadSignalData, parseVariant, drawBorder, renderHeader
} from '@/util/LZRegionPlotUtil'
import { LZ_DISPLAY_OPTIONS, REF_BUILD, REF_BUILD_PORTAL } from '@/constants'
import { formatVariantString } from '@/util/util'

// *** Composables *************************************************************
const tooltipStore = useLZTooltipStore()

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

const emit = defineEmits(['actionMenu-click'])


// *** Props *******************************************************************
const props = defineProps({
  ID: Number,
  variant: String,
  signal: String,
  theme: String,
})

// *** Variables ***************************************************************
const pv = parseVariant(props.variant)
const chromosome = pv.chr
const title = `Plot ${props.ID}: ${props.variant}`

const plotContainer = useTemplateRef('plotContainer')
const svg = ref(null)

const signalData = ref(null)
const recombData = ref(null)

const DIMENSIONS = LZ_DISPLAY_OPTIONS.DIMENSIONS

const plotBackgroundColor = LZ_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch( // render when both signal and recomb data are ready
  () => [signalData.value, recombData.value],
  ([signalData, recombData]) => {
    if (!signalData || !recombData || !plotContainer.value) return

    d3.select(plotContainer.value).selectAll('*').remove()

    svg.value = createSVG(plotContainer.value, DIMENSIONS)

    drawBorder(svg.value, DIMENSIONS, LZ_DISPLAY_OPTIONS.PLOT_BORDER_COLOR)

    renderHeader(svg.value, DIMENSIONS, LZ_DISPLAY_OPTIONS.PLOT_HEADER_COLOR, props.variant, formatVariantString(title), onActionMenuClick)

    const plotSVGCtr = createPlotContainer(svg.value, DIMENSIONS)

    const xAccessor = d => d.x
    const yAccessor = d => d.y

    const xScale = createXscale(xAccessor, signalData, DIMENSIONS)
    const yScaleSignal = createYscaleSignal(yAccessor, signalData, DIMENSIONS)
    const yScaleRecomb = createYscaleRecomb(DIMENSIONS)

    renderXaxis(plotSVGCtr, xScale, DIMENSIONS, chromosome)
    renderYaxisSignal(plotSVGCtr, yScaleSignal, DIMENSIONS)
    renderYaxisRecomb(plotSVGCtr, yScaleRecomb, DIMENSIONS)

    const clipID = `plot-area-clip-${props.ID}`
    const diamondMargin = 12 // allow extra space for lead variant diamond

    // clipPath prevents shapes from overplotting axes
    svg.value.append("defs")
      .append("clipPath")
      .attr("id", clipID)
      .append("rect")
      .attr("x", 0)
      .attr("y", -diamondMargin)
      .attr("width", DIMENSIONS.ctrWidth)
      .attr("height", DIMENSIONS.ctrHeight + diamondMargin)

    const plotGroup = plotSVGCtr.append('g')
      .attr('clip-path', `url(#${clipID})`)

    renderSignalData(plotGroup, signalData, xScale, yScaleSignal, xAccessor, yAccessor, tooltipCallbacks)
    renderRecombLine(plotGroup, recombData, xScale, yScaleRecomb)
    renderGenSigLine(plotGroup, xScale, yScaleSignal)
  },
  { immediate: true }
)

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(() => {
  d3.select(plotContainer.value).selectAll('*').remove()
})

onMounted(async () => {
  signalData.value = await loadSignalData(props.variant, pv, props.signal, REF_BUILD, props.theme)
  recombData.value = await loadRecombData(pv, REF_BUILD_PORTAL)
})

// *** Event handlers **********************************************************
const onActionMenuClick = (event) => {
  console.log(`ActionMenu ${props.ID} clicked!`)
  emit('actionMenu-click', {plotID: props.ID, event})
}
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.outerWrapper {
  border: 1px dotted #cccccc
}
.plot-container {
  margin-right: 1rem;
  margin-top: 0;
}

.plot-wrapper {
  flex: 0 0 auto;
  width: 600px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  border-bottom: 1px dotted #cccccc;
  background-color: #fbfbfb;
}

.hamburger {
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0;
  margin: 0 0.4rem 0.2rem 0;
  line-height: 1;
}

</style>
