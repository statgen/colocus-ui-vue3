<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox @export-plot-group="mzGridEventHandlers.onExportPlotGroup"/>
    </template>

    <h1><BackButton />Multizoom <span class="rc-text">({{ pageRows}}, {{ pageCols}})</span></h1>

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
      @addGenePanel="(payload) => mzGridEventHandlers.onAddGenePanel(payload)"
      @addPlotInsert="(payload) => mzGridEventHandlers.onAddPlot({...payload, insert: true})"
      @addPlotReplace="(payload) => mzGridEventHandlers.onAddPlot({...payload, insert: false})"
      @appendColumn="mzGridEventHandlers.onAppendColumn"
      @appendRow="mzGridEventHandlers.onAppendRow"
      @insertRow="mzGridEventHandlers.onInsertRow"
      @closeMenu="onCloseMenu"
      @deleteCell="mzGridEventHandlers.onDeleteCell"
      @deleteColumn="mzGridEventHandlers.onDeleteColumn"
      @deletePlot="mzGridEventHandlers.onDeletePlot"
      @deleteRow="mzGridEventHandlers.onDeleteRow"
      @exportPlot="mzGridEventHandlers.onExportPlot"
      @insertColumn="mzGridEventHandlers.onInsertColumn"
      @insertMockCell="(payload) => mzGridEventHandlers.onInsertMockCell(payload)"
      @moveColumnInsert="(payload) => mzGridEventHandlers.onMoveColumn({...payload, insert: true})"
      @moveColumnReplace="(payload) => mzGridEventHandlers.onMoveColumn({...payload, insert: false})"
      @movePlotInsert="(payload) => mzGridEventHandlers.onMovePlot({...payload, insert: true})"
      @movePlotReplace="(payload) => mzGridEventHandlers.onMovePlot({...payload, insert: false})"
      @moveRowInsert="(payload) => mzGridEventHandlers.onMoveRow({...payload, insert: true})"
      @moveRowReplace="(payload) => mzGridEventHandlers.onMoveRow({...payload, insert: false})"
    />

    <MZGrid
      @columnClick="mzGridEventHandlers.onColumnHeaderClick"
      @columnMenu="mzGridEventHandlers.onColumnMenu"
      @mockClick="mzGridEventHandlers.onMockClick"
      @mockMenu="mzGridEventHandlers.onMockMenu"
      @click="mzGridEventHandlers.onNativeClick"
      @rowClick="mzGridEventHandlers.onRowHeaderClick"
      @rowMenu="mzGridEventHandlers.onRowMenu"
    />

    <h2 class="mt-4">Data table</h2>

    <div class="table-container mb-8">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        @onPlotIconClick="mzGridEventHandlers.onPlotIconClick"
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
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import DataTable from "@/components/DataTable/DataTable.vue"
import router from '@/router'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { useMZGridEventHandlers } from '@/composables/mzEventHandlers'
import MZGrid from '@/components/misc widgets/MZGrid.vue'
import ActionMenu from "@/components/misc widgets/ActionMenu.vue"

// *** Composables *************************************************************
const appStore = useAppStore()
const mzGridHelpers = useMZGridHelpers()
const mzGridEventHandlers = useMZGridEventHandlers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)

const menuState = mzGridEventHandlers.menuState

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


// *** Event handlers **********************************************************
const onCloseMenu = () => {
  menuState.value.visible = false
  storeMZpage.activePlotID = null
}

const onDataTableRowClick = () => {
  loadPageData()
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
