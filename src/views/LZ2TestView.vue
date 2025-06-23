<template>
  <DefaultLayout>
    <h1>LocusZoom plotter v2 test page</h1>
    <div ref="plotContainer" class="plot-container mt-4">
<!--      <D3RegionPlot :data="genData(500)" title="Plot 1"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 2"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 3"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 4"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 5"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 6"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 7"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 8"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 9"/>-->
<!--      <D3RegionPlot :data="genData(500)" title="Plot 10"/>-->
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import D3RegionPlot from '@/components/D3components/D3RegionPlot.vue'
import { usePlotManager } from '@/composables/D3RPPlotManager'

const { mountPlot, clearAllPlots } = usePlotManager()

const plotContainer = ref(null)
const data = ref([])

const genData = (len) => {
  return Array.from({ length: len }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }))
}

onMounted(() => {
  mountPlot({ id: 'plot1', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 1' })
  mountPlot({ id: 'plot2', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 2' })
  mountPlot({ id: 'plot3', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 3' })
  mountPlot({ id: 'plot4', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 4' })
  mountPlot({ id: 'plot5', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 5' })
  mountPlot({ id: 'plot6', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 6' })
  mountPlot({ id: 'plot7', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 7' })
  mountPlot({ id: 'plot8', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 8' })
  mountPlot({ id: 'plot9', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 9' })
  mountPlot({ id: 'plot10', plotContainer: plotContainer.value, type: 'region', data: genData(500), title: 'Plot 10' })
})

onBeforeUnmount(() => {
  clearAllPlots()
})
</script>

<style scoped>
.plot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}
</style>
