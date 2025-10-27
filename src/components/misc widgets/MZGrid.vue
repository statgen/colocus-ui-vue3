<template>
  <div
    id="plotsContainer"
    class="plots-grid"
    :style="{
      gridTemplateColumns: `minmax(${grid.headerColWidth}px, ${grid.headerColWidth}px) repeat(${grid.cols}, ${grid.cellWidth}px)`,
      gridTemplateRows: `minmax(${grid.headerRowHeight}px, ${grid.headerRowHeight}px) repeat(${grid.rows}, ${grid.cellHeight}px)`,
      gap: `${grid.gap}px`
    }"
  >
    <!-- corner -->
    <div class="slot slot--corner" style="grid-row:1; grid-column:1;"></div>

    <!-- column headers -->
    <div
      v-for="c in grid.cols"
      :key="'colhdr-'+c"
      :style="{ gridRow: 1, gridColumn: c + 1 }"
      class="slot slot--colheader grid-header grid-header--fill"
      @click.stop="onColumnHeaderClick(c, $event)"
      @contextmenu.prevent.stop="onColumnHeaderMenu(c, $event)"
    >
      {{ gridOps.columnLabel(c) }}
    </div>

    <!-- row headers -->
    <div
      v-for="r in grid.rows"
      :key="'rowhdr-'+r"
      :style="{ gridRow: r + 1, gridColumn: 1 }"
      class="slot slot--rowheader grid-header grid-header--fill"
      @click.stop="onRowHeaderClick(r, $event)"
      @contextmenu.prevent.stop="onRowHeaderMenu(r, $event)"
    >
      {{ r }}
    </div>

    <!-- plot cells - iterate through logical grid positions
         Note: In MZPlot, CSS Grid positions are offset by +1 to account for headers:
         - Logical row 1 → CSS gridRow 2 (gridRow 1 is for column headers)
         - Logical col 1 → CSS gridColumn 2 (gridColumn 1 is for row headers)
         This prevents collision with headers -->
    <MZPlot
      v-for="cell in gridCells"
      :key="cell.key"
      :row="cell.row"
      :col="cell.col"
      :plot-id="cell.plotId"
      @mock-click="onMockClick"
      @mock-menu="onMockMenu"
    />
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useMZGrid } from '@/composables/useMZGrid'
import { PAGE_NAMES } from '@/constants'
import MZPlot from '@/components/misc widgets/MZPlot.vue'

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const gridOps = useMZGrid(storeMZpage)

const grid = computed(() => storeMZpage.grid)

const gridMapRef = toRef(storeMZpage, 'gridMap')


const getPlotAt = (row, col) => {
  return gridOps.getPlotAt(row, col)
}

const gridCells = computed(() => {
  const cells = []
  console.log('grid', grid.value)
  for (let r = 1; r <= grid.value.rows; r++) {
    for (let c = 1; c <= grid.value.cols; c++) {
      const key = `${r},${c}`
      const val = gridMapRef.value?.[key]  // ← Vue tracks this!
      console.log('key', key, 'val', val)
      cells.push({ row: r, col: c, key: val, plotId: val === 'mock' ? null : val })
    }
  }
  console.log('cells', cells)
  return cells
})

const emit = defineEmits(['column-menu', 'row-menu', 'mock-click', 'mock-menu'])

const onColumnHeaderClick = (col, event) => emit('column-menu', { col, event, kind: 'click' })
const onColumnHeaderMenu = (col, event) => emit('column-menu', { col, event, kind: 'contextmenu' })
const onRowHeaderClick = (row, event) => emit('row-menu', { row, event, kind: 'click' })
const onRowHeaderMenu = (row, event) => emit('row-menu', { row, event, kind: 'contextmenu' })
const onMockClick = (payload) => emit('mock-click', payload)
const onMockMenu = (payload) => emit('mock-menu', payload)

defineExpose({
  gridOps
})
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
