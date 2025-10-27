<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox @export-plot-group="onExportPlotGroup"/>
    </template>

    <h1><BackButton />Multizoom<v-btn @click="onSwap">swap</v-btn><v-btn @click="onSwap2">swap2</v-btn>
    </h1>

    <BusyOverlay :show="isExporting" />

    <LZ2Tooltip />

    <LZ2ActionMenu
      v-if="showMenu"
      :menu-style="{
        position: 'absolute',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`
      }"
      @delete-plot="onDeletePlot"
      @export-plot="onExportPlot"
      @close-menu="onCloseMenu"
    />

    <!-- FIXME: add handlers for all click and menu event-->
    <MZGrid
      ref="gridRef"
      @column-menu="onColumnMenu"
      @row-menu="onRowMenu"
      @mock-menu="onMockMenu"
    />

    <h2 class="mt-4">Data table</h2>

    <div class="table-container mb-8">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        @onAddBothPlotsClick="onAddBothPlotsClick"
        @on-toggle-plot="onTogglePlot"
      ></DataTable>
    </div>
    <div id="page-bottom-sentinel" aria-hidden="true" style="height:1px;"></div>
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, createVNode, onBeforeUnmount, nextTick, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { useMZPageHelpers } from '@/composables/mzPageHelpers'
import DataTable from "@/components/DataTable/DataTable.vue"
import router from '@/router'
import LZ2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'
import { useMZGrid } from '@/composables/useMZGrid'
import MZGrid from '@/components/misc widgets/MZGrid.vue'

const gridRef = ref(null)
let gridOps = null

// *** Composables *************************************************************
const appStore = useAppStore()
const mzPageHelpers = useMZPageHelpers()
const mzg = useMZGrid()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const multizoomPage = PAGE_NAMES.MULTIZOOM
const storeMZpage = appStore[multizoomPage]
const plotsContainer = useTemplateRef('plotsContainer')
const searchPage = PAGE_NAMES.SEARCH
const showMenu = ref(false)

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

// awkward prevention of browser fore button after back button
if (!appStore.colocID) router.push({ name: searchPage })
mzPageHelpers.unmountAllPlots()

appStore.isToolboxShowing = true

// *** Computed ****************************************************************
const isExporting = computed(() => storeMZpage.isExporting)

// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => storeMZpage.colocDataReady, async (newVal) => {
  if (newVal) {
    loadFPControls.value = !loadFPControls.value

    const colocID = storeMZpage.colocData.uuid
    const signal1 = storeMZpage.colocData.signal1
    const signal2 = storeMZpage.colocData.signal2
    const variant = signal1.lead_variant.vid

    storeMZpage.selectedLDRef = variant
    storeMZpage.signal1Variant = variant
    mzPageHelpers.setPlotRegion(variant, storeMZpage.zoomRegion)

    await renderPlot(colocID, signal1, 'slot1', '1,1')
    await renderPlot(colocID, signal2, 'slot2', '2,1')
    // await scrollBottom()
  }
})

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(async () => {
  appStore.colocID = ''
  await mzPageHelpers.unmountAllPlots()
  appStore.isToolboxShowing = false
})

onMounted(() => {
  appStore.dataTable.expandedRow.length = 0
  storeMZpage.selectedTheme = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)[2]
  loadPageData()
  // Get grid operations
  gridOps = gridRef.value.gridOps

  // Initialize gridMap if empty
  if (!storeMZpage.gridMap || Object.keys(storeMZpage.gridMap).length === 0) {
    gridOps.initializeGridMap()
  }
})

// *** Event handlers **********************************************************
const onActionMenuClick = async (arg) => {
  const rect = arg.event.target.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  storeMZpage.activePlotID = arg.plotID

  const spacing = 4
  const menuWidth = 225

  menuPosition.value = {
    x: rect.left + scrollX - menuWidth - spacing,
    y: rect.bottom + scrollY + spacing,
  }

  showMenu.value = true
}

const onAddBothPlotsClick = async (item) => {
  const { signal1, signal2 } = item
  const colocID = item.uuid
  const s1PlotID = mzPageHelpers.getPlotIDfromRowSlot(colocID, 'slot1')
  const s2PlotID = mzPageHelpers.getPlotIDfromRowSlot(colocID, 'slot2')
  console.log(colocID, s1PlotID, s2PlotID)

  if(s1PlotID && s2PlotID) {
    mzPageHelpers.unmountPlot(s1PlotID)
    mzPageHelpers.unmountPlot(s2PlotID)
  } else if(s1PlotID) {
    await renderPlot(colocID, signal2, 'slot2')
  } else if(s2PlotID) {
    await renderPlot(colocID, signal1, 'slot1')
  } else {
    await renderPlot(colocID, signal1, 'slot1')
    await renderPlot(colocID, signal2, 'slot2')
  }
  // await scrollBottom()
}

const onCloseMenu = () => {
  showMenu.value = false
  storeMZpage.activePlotID = null
}

const onColumnMenu = (args) => {
  console.log('column', args.col, args.kind, args.event)
}

const onMockMenu = (args) => {
  console.log('mock', args.cell, args.kind, args.event)
}

const onRowMenu = (args) => {
  console.log('row', args.row, args.kind, args.event)
}

const onDataTableRowClick = () => {
  loadPageData()
}

const onDeletePlot = () => {
  const plotID = storeMZpage.activePlotID
  mzPageHelpers.unmountPlot(plotID)
  showMenu.value = false
}

const onExportPlot = async () => {
  const plotDOMid = `plot_${storeMZpage.activePlotID}`
  await mzPageHelpers.exportPlotContainer(plotDOMid, `Colocus_${plotDOMid}`)
  showMenu.value = false
}

const onExportPlotGroup = async () => {
  await mzPageHelpers.exportPlotContainer('plotsContainer', 'Colocus_plot_group')
}

const onSwap = async () => {
  mzg.swapCells(1,1,2,1)
}

const onSwap2 = async () => {
  mzg.swapCells(1,1,1,2)
}

const onTogglePlot = async (colocID, signal, slot) => {
  const existingPlot = mzPageHelpers.getPlotIDfromRowSlot(colocID, slot)

  if (existingPlot) {
    mzPageHelpers.unmountPlot(existingPlot)
  } else {
    await renderPlot(colocID, signal, slot)
    // await scrollBottom()
  }
}

// *** Utility functions *******************************************************
const loadPageData = async () => {
  storeMZpage.tableDataLoaded = false
  storeMZpage.colocDataReady = false
  mzPageHelpers.clearPlotRegistry()
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const renderPlot = async (colocID, signal, slot, cell, onActionMenuClick) => {
  const signalID = signal.uuid

  if (storeMZpage.addUniqueRefsOnly) {
    const signals = Object.values(storeMZpage.plotRegistry).map(v => v.signalID)
    if (signals.includes(signalID)) return
  }

  const plotID = appStore.getNextPlotID()
  const variant = signal.lead_variant.vid

  storeMZpage.plotRegistry[plotID] = {
    colocID,
    signalID,
    slot,
    variant,
    signal,
    showGenSigLine: storeMZpage.showGenSigLines,
    showPlotID: storeMZpage.showPlotID,
    showRecombLine: storeMZpage.showRecombLines,
    onActionMenuClick,
  }

  storeMZpage.gridMap[cell] = plotID
  mzPageHelpers.setRowSlotPlotID(colocID, slot, plotID)
  return plotID
}

const scrollBottom = async () => {
  await nextTick()
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  document.getElementById('page-bottom-sentinel')?.scrollIntoView({ behavior: 'smooth', block: 'end' })

  setTimeout(() => {
    document.getElementById('page-bottom-sentinel')?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, 250)
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.plot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.table-container {
  overflow-x: auto;
}

</style>
