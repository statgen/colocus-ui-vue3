<template>
  <div ref="plotContainer" :class="props.chartClass" :style="props.chartStyle" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3v7'

const props = defineProps({
  data: Array,
  dimensions: Object,
  renderPlot: Function,
  chartClass: {
    type: [String, Array, Object],
    default: 'plot-container',
  },
  chartStyle: {
    type: [String, Object],
    default: () => ({}),
  },
})

const plotContainer = ref(null)

let svg = null

function renderPlot(containerEl, data, dimensions) {
  console.warn('LzBasePlot: renderPlot not implemented')
}

function render() {
  if (!props.renderPlot || !plotContainer.value || !props.data?.length) return

  d3.select(plotContainer.value).selectAll('*').remove()
  svg = props.renderPlot(plotContainer.value, props.data, props.dimensions)
}

onMounted(render)

watch(() => [props.data, props.dimensions], render, { deep: true })

onBeforeUnmount(() => {
  d3.select(plotContainer.value).selectAll('*').remove()
})

defineExpose({ renderPlot })
</script>
