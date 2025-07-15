<template>
  <div class="plot-wrapper">
    <h2>{{ props.title }}</h2>
    <LZBasePlot
      class="plot-container"
      ref="baseRef"
      :data="props.signalData"
      :dimensions="dimensions"
      :chart-class="props.chartClass"
      :chart-style="props.chartStyle"
      :render-plot="renderPlot"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
// import LZBasePlot from '@/components/LZComponents/LZBasePlot.vue'
import LZBasePlot from '@/components/LZComponents/LZBasePlot.vue'
import { useLZTooltipStore } from '@/stores/LZTooltipStore'
import { createContainer, createSVG, createXscale, createYscale, renderXaxis, renderYaxis, renderSignalData, renderGenSigLine,
  renderRecombLine } from '@/util/LZRegionPlotUtil'

const tooltipStore = useLZTooltipStore()

const props = defineProps({
  signalData: Array,
  recombData: Object,
  chartClass: [String, Object, Array],
  chartStyle: [String, Object],
  title: String,
  id: String,
  chromosome: Number,
})

const dimensions = {
  height: 200,
  width: 600,
  margins: { top: 15, right: 75, bottom: 45, left: 45 }
}

dimensions.ctrWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right
dimensions.ctrHeight = dimensions.height - dimensions.margins.top - dimensions.margins.bottom

const baseRef = ref(null)

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

let svg = null

function renderPlot(container, data, dimensions) {
  svg = createSVG(container, dimensions)
  const ctr = createContainer(svg, dimensions)

  const xAccessor = d => d.x
  const yAccessor = d => d.y

  const xPaddingFactor = 0.01
  const yPaddingFactor = 0.03

  const xScale = createXscale(xAccessor, xPaddingFactor, data, dimensions)
  const yScale = createYscale(yAccessor, yPaddingFactor, data, dimensions)

  renderXaxis(ctr, xScale, dimensions, props.chromosome)
  renderYaxis(ctr, yScale, dimensions)

  renderSignalData(ctr, data, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks)

  if(true) {
    renderGenSigLine (ctr, xScale, yScale)
  }

  if(true) {
    renderRecombLine(ctr, props.recombData, xScale, yPaddingFactor, dimensions)
  }

  return svg
}

onBeforeUnmount(() => {
  if (svg) {
    svg.remove()
    svg = null
  }
})
</script>

<style scoped>
.plot-container {
  background-color: #fbfbfb;
  margin-right: 1rem;
  margin-top: 0;
}

.plot-container :deep(.axis) {
  font-size: 1rem;
  shape-rendering: geometricPrecision;
}

.plot-wrapper {
  /*display: inline-block;*/
  flex: 0 0 auto;
  width: 600px;
}

</style>
