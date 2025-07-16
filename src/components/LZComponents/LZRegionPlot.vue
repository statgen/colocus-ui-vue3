<template>
  <div class="header-row">
    <h2>{{ title }}</h2>
    <button class="hamburger" @click="onHamburgerClick" aria-label="Open plot menu">
      &#9776;
    </button>
  </div>
  <div ref="plotContainer" class="plot-container" />
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as d3 from 'd3v7'
import { useLZTooltipStore } from '@/stores/LZTooltipStore'
import {
  createContainer, createSVG, createXscale, createYscale,
  renderXaxis, renderYaxis, renderSignalData, renderGenSigLine, renderRecombLine,
  loadRecombData, loadSignalData, parseVariant
} from '@/util/LZRegionPlotUtil'
import { REF_BUILD, REF_BUILD_PORTAL } from '@/constants'

// *** Composables *************************************************************
const tooltipStore = useLZTooltipStore()

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

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

const plotContainer = ref(null)
const svg = ref(null)

const signalData = ref(null)
const recombData = ref(null)

const dimensions = {
  height: 200,
  width: 600,
  margins: { top: 15, right: 75, bottom: 45, left: 45 },
}
dimensions.ctrWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right
dimensions.ctrHeight = dimensions.height - dimensions.margins.top - dimensions.margins.bottom

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch( // render when both signal and recomb data are ready
  () => [signalData.value, recombData.value],
  ([signal, recomb]) => {
    if (!signal || !recomb || !plotContainer.value) return

    d3.select(plotContainer.value).selectAll('*').remove()

    svg.value = createSVG(plotContainer.value, dimensions)
    const ctr = createContainer(svg.value, dimensions)

    const xAccessor = d => d.x
    const yAccessor = d => d.y

    const xScale = createXscale(xAccessor, 0.01, signal, dimensions)
    const yScale = createYscale(yAccessor, 0.03, signal, dimensions)

    renderXaxis(ctr, xScale, dimensions, chromosome)
    renderYaxis(ctr, yScale, dimensions)

    renderSignalData(ctr, signal, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks)
    renderGenSigLine(ctr, xScale, yScale)
    renderRecombLine(ctr, recomb, xScale, 0.03, dimensions)
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
const onHamburgerClick = () => {
  console.log(`Clicked hamburger on plot ${props.ID}`)
}
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.plot-container {
  background-color: #fbfbfb;
  margin-right: 1rem;
  margin-top: 0;
}

.plot-wrapper {
  flex: 0 0 auto;
  width: 600px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.hamburger {
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0;
  margin: 0 0.8rem 0 0;
  line-height: 1;
}

</style>
