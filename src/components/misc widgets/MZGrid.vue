<template>
  <div
    :id="containerID"
    class="plots-grid"
    :style="{
      gridTemplateColumns: `minmax(${gridSettings.headerColWidth}px, ${gridSettings.headerColWidth}px) repeat(${gridSettings.cols}, ${gridSettings.cellWidth}px)`,
      gridTemplateRows: `minmax(${gridSettings.headerRowHeight}px, ${gridSettings.headerRowHeight}px) repeat(${gridSettings.rows}, ${gridSettings.cellHeight}px)`,
      gap: `${gridSettings.gap}px`
    }"
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
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { PAGE_NAMES } from '@/constants'
import MZPlot from '@/components/misc widgets/MZPlot.vue'
import { LZ2_DISPLAY_OPTIONS } from '@/constants'

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const mzGridHelpers = useMZGridHelpers()

const containerID = LZ2_DISPLAY_OPTIONS.PLOTS_CONTAINER_ID

const gridSettings = computed(() => storeMZpage.gridSettings)

const gridMapRef = toRef(storeMZpage, 'gridMap')

const gridCells = computed(() => {
  const cells = []
  for (let r = 1; r <= gridSettings.value.rows; r++) {
    for (let c = 1; c <= gridSettings.value.cols; c++) {
      const cell = `${r},${c}`
      const val = gridMapRef.value?.[cell]
      cells.push({
        row: r,
        col: c,
        key: val === 'mock' ? `cell-${cell}` : val,
        plotID: val === 'mock' ? null : val
      })
    }
  }
  return cells
})

const emit = defineEmits(['column-click', 'column-menu', 'row-click', 'row-menu', 'mock-click', 'mock-menu'])

const onColumnHeaderClick = (col, event) => emit('column-click', { col, event, kind: 'click' })
const onColumnHeaderMenu = (col, event) => emit('column-menu', { col, event, kind: 'contextmenu' })
const onRowHeaderClick = (row, event) => emit('row-click', { row, event, kind: 'click' })
const onRowHeaderMenu = (row, event) => emit('row-menu', { row, event, kind: 'contextmenu' })
const onMockClick = (payload) => emit('mock-click', payload)
const onMockMenu = (payload) => emit('mock-menu', payload)

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
</style>
