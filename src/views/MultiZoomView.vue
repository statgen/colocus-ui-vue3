<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox @export-plot-group="onExportPlotGroup"/>
    </template>

    <h1><BackButton />Multizoom  <span class="rc-text">({{ pageRows}}, {{ pageCols}})</span></h1>

    <BusyOverlay :show="isExporting" />

    <LZ2Tooltip />

    <ActionMenu v-if="menuState.visible"
      :menu-type="menuState.type"
      :menu-style="{
        position: 'absolute',
        top: `${menuState.yPos}px`,
        left: `${menuState.xPos}px`
      }"
      :context="menuState.context"
      @insertColumn="onInsertColumn"
      @addPlotInsert="onAddPlotInsert"
      @addPlotReplace="onAddPlotReplace"
      @insertRow="onInsertRow"
      @closeMenu="onCloseMenu"
      @deleteCell="onDeleteCell"
      @deleteColumn="onDeleteColumn"
      @deletePlot="onDeletePlot"
      @deleteRow="onDeleteRow"
      @exportPlot="onExportPlot"
      @insertMockCell="(payload) => onInsertMockCell(payload)"
      @moveColumnInsert="(payload) => onMoveColumn({...payload, insert: true})"
      @moveColumnReplace="(payload) => onMoveColumn({...payload, insert: false})"
      @movePlotInsert="onMovePlotInsert"
      @movePlotReplace="onMovePlotReplace"
      @moveRowInsert="(payload) => onMoveRow({...payload, insert: true})"
      @moveRowReplace="(payload) => onMoveRow({...payload, insert: false})"
    />

    <MZGrid
      @columnClick="onColumnHeaderClick"
      @columnMenu="onColumnMenu"
      @mockClick="onMockClick"
      @mockMenu="onMockMenu"
      @click="onNativeClick"
      @rowClick="onRowHeaderClick"
      @rowMenu="onRowMenu"
    />

    <h2 class="mt-4">Data table</h2>

    <div class="table-container mb-8">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        @onPlotIconClick="onPlotIconClick"
      ></DataTable>
    </div>
    <div id="page-bottom-sentinel" aria-hidden="true" style="height:1px;"></div>
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, onBeforeUnmount, nextTick, onMounted, provide, ref, watch } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, MZ_GRID_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import DataTable from "@/components/DataTable/DataTable.vue"
import router from '@/router'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import MZGrid from '@/components/misc widgets/MZGrid.vue'
import ActionMenu from "@/components/misc widgets/ActionMenu.vue";

// *** Composables *************************************************************
const appStore = useAppStore()
const mzGridHelpers = useMZGridHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)

const menuState = ref({
  visible: false,
  type: 'hamburger',
  context: {},
  xPos: 0,
  yPos: 0,
})

const multizoomPage = PAGE_NAMES.MULTIZOOM
const storeMZpage = appStore[multizoomPage]
const searchPage = PAGE_NAMES.SEARCH

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

// awkward prevention of browser fore button after back button
if (!appStore.colocID) router.push({ name: searchPage })
mzGridHelpers.deleteAllPlots()

appStore.isToolboxShowing = true

// *** Computed ****************************************************************
const isExporting = computed(() => storeMZpage.isExporting)
const pageRows = computed(() => storeMZpage.gridSettings.rows)
const pageCols = computed(() => storeMZpage.gridSettings.cols)


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
    mzGridHelpers.setPlotRegion(variant, storeMZpage.zoomRegion)

    await mzGridHelpers.addPlot({ cell: 'A1', colocID, signal: signal1, slot: 'slot1' })
    await mzGridHelpers.addPlot({ cell: 'A2', colocID, signal: signal2, slot: 'slot2' })
    // await scrollBottom()
  }
})

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(async () => {
  appStore.colocID = ''
  await mzGridHelpers.deleteAllPlots()
  appStore.isToolboxShowing = false
})

onMounted(() => {
  appStore.dataTable.expandedRow.length = 0
  storeMZpage.selectedTheme = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)[2]
  loadPageData()
})

// *** Event handlers (grid) ***************************************************
const onColumnHeaderClick = (args) => {
  // console.log('column click', args.col, args.kind, args.event)
  showPlotActionMenu({ ...args, menuType: 'column-header' })
}

const onColumnMenu = (args) => {
  // console.log('column menu', args.col, args.kind, args.event)
}

const onMockClick = (args) => {
  showPlotActionMenu({ ...args, menuType: 'mock-cell' })
}

const onMockMenu = (args) => {
  // console.log('mock menu', args.row, args.col, args.event)
}

const onNativeClick = (event) => {
  const action = event.target.dataset.action;

  switch(action) {
    case 'hamburger-menu':
      const plotID = event.target.dataset.plotId
      storeMZpage.activePlotID = plotID
      showPlotActionMenu({plotID, menuType: 'hamburger', event})
      break;
    default:
      console.warn('Unknown click event')
      break;
  }
}

const onRowHeaderClick = (args) => {
  showPlotActionMenu({ ...args, menuType: 'row-header' })
}

const onRowMenu = (args) => {
  // console.log('row menu', args.row, args.kind, args.event)
}

// *** Event handlers (action menu) ********************************************
const onInsertColumn = (args) => {
  const atCol = args.col
  mzGridHelpers.insertColumn(atCol)
  menuState.value.visible = false
}

const onAddPlotInsert = async ({ colocID, inputValue, signal, slot }) => {
  menuState.value.visible = false
  if(!inputValue) return
  const cell = inputValue.toUpperCase()
  await mzGridHelpers.addPlot({ cell, colocID, signal, slot, insert: true })
}

const onAddPlotReplace = async ({ colocID, inputValue, insert, signal, slot }) => {
  menuState.value.visible = false
  if(!inputValue) return
  const cell = inputValue.toUpperCase()
  await mzGridHelpers.addPlot({ cell, colocID: colocID, signal, slot, insert: false })
}

const onInsertRow = (args) => {
  const atRow = args.row
  mzGridHelpers.insertRow(atRow)
  menuState.value.visible = false
}

const onCloseMenu = () => {
  menuState.value.visible = false
  storeMZpage.activePlotID = null
}

const onDeleteCell = (args) => {
  mzGridHelpers.deleteMockCell(args.row, args.col)
  menuState.value.visible = false
}

const onDeleteColumn = (args) => {
  const atCol = args.col
  mzGridHelpers.deleteColumn(atCol)
  menuState.value.visible = false
}

const onDeletePlot = () => {
  const plotID = storeMZpage.activePlotID
  if(plotID) mzGridHelpers.deletePlot(plotID, true)
  menuState.value.visible = false
}

const onDeleteRow = (args) => {
  const atRow = args.row
  mzGridHelpers.deleteRow(atRow)
  menuState.value.visible = false
}

const onExportPlot = async () => {
  const plotDOMid = `plot_${storeMZpage.activePlotID}`
  await mzGridHelpers.exportPlotContainer(plotDOMid, `Colocus_${plotDOMid}`)
  menuState.value.visible = false
}

const onInsertMockCell = (args) => {
  menuState.value.visible = false
  if(args.plotID) { // user clicked hamburger menu
    const cell = storeMZpage.plotRegistry[args.plotID].cell
    const { col, row } = mzGridHelpers.parseCRReference(cell)
    mzGridHelpers.insertMockCell(row, col)
  } else if(args.row && args.col) { // user clicked empty/mock cell
    mzGridHelpers.insertMockCell(args.row, args.col)
  }
}

const onMoveColumn = (args) => {
  menuState.value.visible = false
  const iv = args.inputValue
  if(!iv) return
  const fromCol = args.col
  const toCol = mzGridHelpers.columnNumber(iv)
  const insert = args.insert
  mzGridHelpers.moveColumn(fromCol, toCol, insert)
}

const onMovePlotInsert = ({inputValue, plotID }) => {
  menuState.value.visible = false
  if(!inputValue || !plotID) return
  const pid = parseInt(plotID)
  const toCell = inputValue.toUpperCase()
  mzGridHelpers.movePlot({ plotID: pid, toCell, insert: true })
}

const onMovePlotReplace = ({ inputValue, plotID }) => {
  menuState.value.visible = false
  if(!inputValue || !plotID) return
  const pid = parseInt(plotID)
  const toCell = inputValue.toUpperCase()
  mzGridHelpers.movePlot({plotID: pid, toCell, insert: false })
}

const onMoveRow = (args) => {
  const fromRow = args.row
  const toRow = args.inputValue
  const insert = args.insert
  mzGridHelpers.moveRow(fromRow, toRow, insert)
  menuState.value.visible = false
}

// *** Event handlers (misc) ***************************************************
const onExportPlotGroup = async () => {
  await mzGridHelpers.exportPlotContainer(LZ2_DISPLAY_OPTIONS.PLOTS_CONTAINER_ID, 'Colocus_plot_group')
}

const onDataTableRowClick = () => {
  loadPageData()
}

const onPlotIconClick = async (args) => {
  const plotID = args.plotID
  storeMZpage.activePlotID = plotID
  showPlotActionMenu({ ...args, menuType: 'datatable' })
}

// *** Utility functions *******************************************************
const loadPageData = async () => {
  storeMZpage.tableDataLoaded = false
  storeMZpage.colocDataReady = false
  mzGridHelpers.initializePlotSession()
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const scrollBottom = async () => {
  await nextTick()
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  document.getElementById('page-bottom-sentinel')?.scrollIntoView({ behavior: 'smooth', block: 'end' })

  setTimeout(() => {
    document.getElementById('page-bottom-sentinel')?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, 250)
}

const showPlotActionMenu = (args) => {
  const target = args.event.target.closest('.mock-plot, .grid-header, [data-action="hamburger-menu"]') || args.event.target
  const rect = target.getBoundingClientRect()

  const ySpace = 32
  const menuWidth = MZ_GRID_DISPLAY_OPTIONS.actionMenuWidth
  const xPos = rect.left + (rect.width / 2) - (menuWidth / 2)
  const yPos = args.event.clientY + ySpace

  menuState.value = {
    visible: true,
    type: args.menuType,
    context: {
      col: args.col,
      colocID: args.colocID,
      plotID: args.plotID,
      row: args.row,
      signal: args.signal,
      slot: args.slot,
    },
    xPos: xPos,
    yPos: yPos,
  }
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.rc-text {
  font-size: 1rem;
}
</style>
