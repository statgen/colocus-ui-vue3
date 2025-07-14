<template>
  <div class="plot-wrapper">
    <h2>{{ props.title }}</h2>
    <D3BasePlot
      class="plot-container"
      ref="baseRef"
      :data="props.data"
      :dimensions="dimensions"
      :chart-class="props.chartClass"
      :chart-style="props.chartStyle"
      :render-plot="renderPlot"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import D3BasePlot from '@/components/D3components/D3BasePlot.vue'
import { useD3TooltipStore } from '@/stores/D3TooltipStore'
import { createContainer, createSVG, createXscale, createYscale, renderXaxis, renderYaxis, renderData, renderGenSigLine } from '@/util/D3RegionPlotUtil'

const tooltipStore = useD3TooltipStore()

const props = defineProps({
  data: Array,
  chartClass: [String, Object, Array],
  chartStyle: [String, Object],
  title: String,
  id: String,
  chromosome: Number,
})

const dimensions = {
  height: 200,
  width: 600,
  margins: { top: 10, right: 30, bottom: 45, left: 45 }
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
let tooltip = null

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

  renderData(ctr, data, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks)
  renderGenSigLine (ctr, xScale, yScale)

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
