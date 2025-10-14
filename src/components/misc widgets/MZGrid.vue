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
    <div v-for="c in grid.cols"
      @click.stop="onColumnHeaderClick(c, $event)"
      @contextmenu.prevent.stop="onColumnHeaderMenu(c, $event)"
      :key="'colhdr-'+c"
      :style="{ gridRow: 1, gridColumn: c + 1 }"
      class="slot slot--colheader grid-header grid-header--fill"
    >
      {{ mzGridHelpers.columnLabel(c) }}
    </div>

    <!-- row headers -->
    <div v-for="r in grid.rows"
      @click.stop="onRowHeaderClick(r, $event)"
      @contextmenu.prevent.stop="onRowHeaderMenu(r, $event)"
      :key="'rowhdr-'+r"
      :style="{ gridRow: r + 1, gridColumn: 1 }"
      class="slot slot--rowheader grid-header grid-header--fill"
    > {{ r }}
    </div>

    <!-- plot cells -->
    <component v-for="(val, key) in gridMap"
      :key="key"
      :is="val === 'mock' ? MZMockPlot : MZPlot"
      :cell="key"
      :plotID="val !== 'mock' ? val : undefined"
    />
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { PAGE_NAMES } from '@/constants'
import MZPlot from '@/components/misc widgets/MZPlot.vue'
import MZMockPlot from '@/components/misc widgets/MZMockPlot.vue'

// *** Composables *************************************************************
const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]
const mzGridHelpers = useMZGridHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const cells = computed(() => storeMZpage.cells)
const grid  = computed(() => storeMZpage.grid)
// const plots = computed(() => storeMZpage.plotSettings) // available if mountPlot needs config
const gridMap = storeMZpage.gridMap

// *** Computed ****************************************************************
const cellList = computed(() => {
  const list = []
  for (let r = 1; r <= grid.value.rows; r++) {
    for (let c = 1; c <= grid.value.cols; c++) {
      list.push({ r, c, key: cellKey(r, c) })
    }
  }
  console.log('cellList', list)
  return list
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['column-menu', 'mock-menu', 'row-menu'])

// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onColumnHeaderClick = (col, event) => emit('column-menu', { col, event, kind: 'click' })
const onColumnHeaderMenu  = (col, event) => emit('column-menu', { col, event, kind: 'contextmenu' })
const onRowHeaderClick    = (row, event) => emit('row-menu',    { row, event, kind: 'click' })
const onRowHeaderMenu     = (row, event) => emit('row-menu',    { row, event, kind: 'contextmenu' })
const onMockClick         = (cell, event) => emit('mock-menu',  { cell, event, kind: 'click' })
const onMockMenu          = (cell, event) => emit('mock-menu',  { cell, event, kind: 'contextmenu' })

// *** Utility functions *******************************************************
const cellKey = (r, c) => mzGridHelpers.ck(r, c)

// const columnLabel = (n) => {
//   let s = ''
//   while (n > 0) {
//     const rem = (n - 1) % 26
//     s = String.fromCharCode(65 + rem) + s
//     n = Math.floor((n - 1) / 26)
//   }
//   return s
// }

// *** Configuration data ******************************************************
  // --- PlotCell subcomponent ---
  // Mounts/unmounts plots into a cell DOM node using your LZ2RegionPlotManager
//   const PlotCell = defineComponent({
//     name: 'PlotCell',
//     props: {
//       r: { type: Number, required: true },
//       c: { type: Number, required: true },
//       plotId: { type: String, default: null },
//       width: { type: Number, required: true },
//       height: { type: Number, required: true },
//     },
//   setup(props) {
//     const mountRef = ref(null)
//     const currentPlotId = ref(null)
//
//     const mountIfNeeded = async () => {
//       if (!mountRef.value) return
//       if (currentPlotId.value && currentPlotId.value !== props.plotId) {
//        try { LZ2RegionPlotManager.unmountPlot(currentPlotId.value) } catch(e) { /* no-op */ }
//         currentPlotId.value = null
//       }
//     if (props.plotId && props.plotId !== currentPlotId.value) {
//       await nextTick()
//       // If your manager needs config: const cfg = plots.value[props.plotId]?.config
//       // Signature assumption: mountPlot(plotId, mountEl, config?)
//       LZ2RegionPlotManager.mountPlot(props.plotId, mountRef.value /*, cfg */)
//       currentPlotId.value = props.plotId
//     }
//   }
//
//   const unmountIfMounted = () => {
//   if (currentPlotId.value) {
//     try { LZ2RegionPlotManager.unmountPlot(currentPlotId.value) } catch(e) { /* no-op */ }
//     currentPlotId.value = null
//   }
//   }
//
//   watch(() => props.plotId, () => mountIfNeeded(), { immediate: true })
//   onMounted(() => mountIfNeeded())
//   onBeforeUnmount(() => unmountIfMounted())
//
//   return () => (
//     <div
//     class="cell-mount"
//     style={{ width: props.width + 'px', height: props.height + 'px' }}
//         ref={mountRef}
//         data-cell={`${props.r},${props.c}`}
//     ></div>
//   )
// }
// })
</script>

<style scoped>
.plots-grid {
  display: grid;
  --grid-line: rgba(0,0,0,0.28);
  position: relative;
  /* gridTemplateColumns/Rows + gap come from :style */
}

/* Full-size wrapper for each grid slot (headers + cells) */
.slot { position: relative; }

/* Only headers get per-slot outlines */
.slot--corner::after,
.slot--colheader::after,
.slot--rowheader::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 0 1px var(--grid-line) inset;
}

/* Center header buttons */
.grid-header { background:#fafafa; border:0; cursor:pointer; font-weight: bold; font-size:1rem; }
.grid-header--fill { display: flex; width:100%; height:100%; box-sizing:border-box; align-items: center; justify-content: center;}

/* Export mode: hide ALL grid chrome, keep plot/mock borders */
.plots-grid.export-mode::after { box-shadow: none; }
.plots-grid.export-mode .slot--corner,
.plots-grid.export-mode .slot--colheader,
.plots-grid.export-mode .slot--rowheader { display: none !important; }
.plots-grid.export-mode .slot--corner::after,
.plots-grid.export-mode .slot--colheader::after,
.plots-grid.export-mode .slot--rowheader::after { box-shadow: none; }
/* Leave .mock-plot as-is so the “plot border” remains in the export */
</style>
