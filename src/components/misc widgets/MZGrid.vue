<template>
  <div
    :id="containerID"
    class="plots-grid"
    ref="gridContainer"
    :style="{
      gridTemplateColumns: `minmax(${gridSettings.headerColWidth}px, ${gridSettings.headerColWidth}px) repeat(${gridSettings.cols}, ${gridSettings.cellWidth}px)`,
      gridTemplateRows: `minmax(${gridSettings.headerRowHeight}px, ${gridSettings.headerRowHeight}px) repeat(${gridSettings.rows}, ${gridSettings.cellHeight}px)`,
      gap: `${gridSettings.gap}px`
    }"
    @mousemove="onMouseMove"
  >

    <!-- corner -->
    <div class="slot slot--corner" style="grid-row:1; grid-column:1;"></div>

    <!-- column headers -->
    <div
      v-for="c in gridSettings.cols"
      :key="'colhdr-'+c"
      :style="{ gridRow: 1, gridColumn: c + 1 }"
      class="slot slot--colheader grid-header grid-header--fill"
      @click.stop="onColumnHeaderClick(c, $event)"
      @contextmenu.prevent.stop="onColumnHeaderMenu(c, $event)"
    >
      {{ mzGridHelpers.columnLabel(c) }}
    </div>

    <!-- row headers -->
    <div
      v-for="r in gridSettings.rows"
      :key="'rowhdr-'+r"
      :style="{ gridRow: r + 1, gridColumn: 1 }"
      class="slot slot--rowheader grid-header grid-header--fill"
      @click.stop="onRowHeaderClick(r, $event)"
      @contextmenu.prevent.stop="onRowHeaderMenu(r, $event)"
    >
      {{ r }}
    </div>

    <MZPlot
      v-for="cell in gridCells"
      :key="cell.key"
      :row="cell.row"
      :col="cell.col"
      :plotID="cell.plotID"
      @mock-click="onMockClick"
      @mock-menu="onMockMenu"
    />

    <!-- Crosshair overlay -->
    <div
      v-if="storeMZpage.showCrosshair && crosshairPosition"
      class="crosshair-overlay"
      :style="crosshairStyle"
    >
      <div class="crosshair-vertical" :style="{ left: crosshairPosition.x + 'px' }"></div>
      <div class="crosshair-horizontal" :style="{ top: crosshairPosition.y + 'px' }"></div>
    </div>
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { PAGE_NAMES } from '@/constants'
import MZPlot from '@/components/misc widgets/MZPlot.vue'
import { LZ2_DISPLAY_OPTIONS, MZ_GRID_DISPLAY_OPTIONS } from '@/constants'

// *** Composables *************************************************************
const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const mzGridHelpers = useMZGridHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const containerID = LZ2_DISPLAY_OPTIONS.PLOTS_CONTAINER_ID
const crosshairPosition = ref(null)
const gridContainer = ref(null)
const gridSettings = storeMZpage.gridSettings
const MOCK = MZ_GRID_DISPLAY_OPTIONS.mockCell


// *** Computed ****************************************************************
const gridCells = computed(() => {
  const cells = []
  for (let r = 1; r <= gridSettings.rows; r++) {
    for (let c = 1; c <= gridSettings.cols; c++) {
      const cell = mzGridHelpers.cellKey(r,c)
      const plotID = storeMZpage.gridMap[cell]
      cells.push({
        row: r,
        col: c,
        key: plotID === MOCK ? `cell-${cell}` : plotID,
        plotID: plotID === MOCK ? null : plotID
      })
    }
  }
  return cells
})

const crosshairStyle = computed(() => {
  const gs = gridSettings
  const gap = gs.gap

  // dimensions of cell area (excluding headers)
  const cellAreaWidth = gs.cols * gs.cellWidth + (gs.cols - 1) * gap
  const cellAreaHeight = gs.rows * gs.cellHeight + (gs.rows - 1) * gap

  // start after headers
  const leftOffset = gs.headerColWidth + gap
  const topOffset = gs.headerRowHeight + gap

  return {
    left: leftOffset + 'px',
    top: topOffset + 'px',
    width: cellAreaWidth + 'px',
    height: cellAreaHeight + 'px'
  }
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['column-click', 'column-menu', 'row-click', 'row-menu', 'mock-click', 'mock-menu'])

// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onColumnHeaderClick = (col, event) => emit('column-click', { col, event, kind: 'click' })
const onColumnHeaderMenu = (col, event) => emit('column-menu', { col, event, kind: 'contextmenu' })
const onRowHeaderClick = (row, event) => emit('row-click', { row, event, kind: 'click' })
const onRowHeaderMenu = (row, event) => emit('row-menu', { row, event, kind: 'contextmenu' })
const onMockClick = (payload) => emit('mock-click', payload)
const onMockMenu = (payload) => emit('mock-menu', payload)

const onMouseMove = (event) => {
  if (!storeMZpage.showCrosshair) return

  const rect = gridContainer.value.getBoundingClientRect()
  const gs = gridSettings
  const gap = gs.gap
  const leftOffset = gs.headerColWidth + gap
  const topOffset = gs.headerRowHeight + gap

  // position relative to cell area (excluding headers)
  const x = event.clientX - rect.left - leftOffset
  const y = event.clientY - rect.top - topOffset

  // show crosshair if mouse within cell area
  const cellAreaWidth = gs.cols * gs.cellWidth + (gs.cols - 1) * gap
  const cellAreaHeight = gs.rows * gs.cellHeight + (gs.rows - 1) * gap

  if (x >= 0 && x <= cellAreaWidth && y >= 0 && y <= cellAreaHeight) {
    crosshairPosition.value = { x, y }
  } else {
    crosshairPosition.value = null
  }
}

// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
</script>

<style scoped>
.plots-grid {
  display: grid;
  --grid-line: rgba(0,0,0,0.28);
  position: relative;
}

.slot {
  position: relative;
}

.slot--corner::after,
.slot--colheader::after,
.slot--rowheader::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 0 1px var(--grid-line) inset;
}

.grid-header {
  background: #fafafa;
  border: 0;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

.grid-header--fill {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}

/* Export mode: hide grid chrome */
.plots-grid.export-mode::after {
  box-shadow: none;
}

.plots-grid.export-mode .slot--corner,
.plots-grid.export-mode .slot--colheader,
.plots-grid.export-mode .slot--rowheader {
  display: none !important;
}

.plots-grid.export-mode .slot--corner::after,
.plots-grid.export-mode .slot--colheader::after,
.plots-grid.export-mode .slot--rowheader::after {
  box-shadow: none;
}

.crosshair-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
}

.crosshair-vertical,
.crosshair-horizontal {
  position: absolute;
  background-color: rgba(var(--v-theme-clcAction), 1.0);
  pointer-events: none;
}

.crosshair-vertical {
  width: 0.5px;
  height: 100%;
  top: 0;
}

.crosshair-horizontal {
  width: 100%;
  height: 0.5px;
  left: 0;
}
</style>
