<template>
  <div :id="cellID" class="plot-cell" :style="{ gridRow: row + 1, gridColumn: col + 1 }" :data-cell="cellKey">
    <div v-if="isMock" class="mock-plot" @click.stop="onMockClick" @contextmenu.prevent.stop="onMockContextMenu">
      <div class="mock-content">{{ cellKey }}</div>
    </div>
    <component v-else-if="isGenePanel" :is="LZ2GenePanel" :plotID/>
    <component v-else-if="plotConfig" :is="LZ2RegionPlot" v-bind="plotProps"/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'
import LZ2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'
import LZ2GenePanel from '@/components/LZ2Components/LZ2GenePanel.vue'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const mzGridHelpers = useMZGridHelpers()

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  plotID: { type: [String, Number], default: null }
})

const cellKey = mzGridHelpers.cellKey(props.row, props.col)
const cellID = `cell_${cellKey}`
const plotID = props.plotID

const emit = defineEmits(['mock-click', 'mock-menu'])

// *** Computed ****************************************************************
const isMock = computed(() => !plotID)

const isGenePanel = computed(() => {
  return plotID && String(plotID).startsWith('gene_panel_')
})

const plotConfig = computed(() => {
  return storeMZpage.plotRegistry[plotID]
})

const plotProps = computed(() => {
  const config = plotConfig.value

  return {
    ID: plotID,
    showGenSigLine: config.showGenSigLine ?? storeMZpage.showGenSigLines,
    showRecombLine: config.showRecombLine ?? storeMZpage.showRecombLines,
    signal: config.signal,
    signalID: config.signalID,
    variant: config.variant,
  }
})

// *** Event handlers **********************************************************
const onMockClick = (event) => {
  emit('mock-click', { row: props.row, col: props.col, event })
}

const onMockContextMenu = (event) => {
  emit('mock-menu', { row: props.row, col: props.col, event })
}

</script>

<style scoped>
.plot-cell {
  background: white;
  overflow: visible;
  position: relative;
}

.mock-plot {
  align-items: center;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.mock-plot:hover .mock-content {
  font-weight: bold;
}

.mock-content {
  color: rgba(var(--v-theme-clcHeading), 1.0);
  font-size: 1.25rem;
  font-weight: normal;
  user-select: none;
}
</style>
