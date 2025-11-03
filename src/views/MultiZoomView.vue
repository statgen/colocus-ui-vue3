<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox @export-plot-group="onExportPlotGroup"/>
    </template>

    <h1><BackButton />Multizoom
      <v-btn @click="onSwap" size="small" class="ml-2">swap V</v-btn>
      <v-btn @click="onSwap2" size="small" class="ml-2">swap H</v-btn>
    </h1>

    <BusyOverlay :show="isExporting" />

    <LZ2Tooltip />

    <ActionMenu
      v-if="menuState.visible"
      :menu-type="menuState.type"
      :menu-style="{
        position: 'absolute',
        top: `${menuState.yPos}px`,
        left: `${menuState.xPos}px`
      }"
      :context="menuState.context"
      @delete-plot="onDeletePlot"
      @export-plot="onExportPlot"
      @close-menu="onCloseMenu"
    />

    <MZGrid
      @column-click="onColumnClick"
      @column-menu="onColumnMenu"
      @row-click="onRowClick"
      @row-menu="onRowMenu"
      @mock-click="onMockClick"
      @mock-menu="onMockMenu"
      @click="handleNativeClick"
    />

    <h2 class="mt-4">Data table</h2>

    <div class="table-container mb-8">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        @on-toggle-plot="onTogglePlot"
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
import MZGrid from '@/components/misc widgets/MZGrid.vue'

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

    await mzGridHelpers.renderPlot(colocID, signal1, 'slot1', '1,1')
    await mzGridHelpers.renderPlot(colocID, signal2, 'slot2', '2,1')
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
  mzGridHelpers.initializeGridMap()
})

// *** Event handlers **********************************************************
const handleNativeClick = (event) => {
  const action = event.target.dataset.action;

  switch(action) {
    case 'hamburger-menu':
      const plotID = event.target.dataset.plotId
      showPlotActionMenu({plotID, event})
      break;
    default:
      console.warn('Unknown click event')
      break;
  }
};

const showPlotActionMenu = (args) => {

  storeMZpage.activePlotID = args.plotID

  const rect = args.event.target.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  const spacing = 4
  const menuWidth = 225
  const xPos = rect.left + scrollX - menuWidth - spacing
  const yPos = rect.bottom + scrollY + spacing

  menuState.value = {
    visible: true,
    type: 'hamburger',
    context: { plotID: args.plotID },
    xPos: xPos,
    yPos: yPos,
  }
}


const onCloseMenu = () => {
  menuState.value.visible = false
  storeMZpage.activePlotID = null
}

const onColumnClick = (args) => {
  console.log('column click', args.col, args.kind, args.event)
}

const onColumnMenu = (args) => {
  // console.log('column menu', args.col, args.kind, args.event)
}

const onMockClick = (args) => {
  console.log('mock click', args.row, args.col, args.event)
}

const onMockMenu = (args) => {
  // console.log('mock menu', args.row, args.col, args.event)
}

const onRowClick = (args) => {
  console.log('row click', args.row, args.kind, args.event)
}

const onRowMenu = (args) => {
  // console.log('row menu', args.row, args.kind, args.event)
}

const onDataTableRowClick = () => {
  loadPageData()
}

const onDeletePlot = () => {
  const plotID = storeMZpage.activePlotID
  mzGridHelpers.deletePlot(plotID, true)
  menuState.value.visible = false
}

const onExportPlot = async () => {
  const plotDOMid = `plot_${storeMZpage.activePlotID}`
  await mzGridHelpers.exportPlotContainer(plotDOMid, `Colocus_${plotDOMid}`)
  menuState.value.visible = false
}

const onExportPlotGroup = async () => {
  await mzGridHelpers.exportPlotContainer(LZ2_DISPLAY_OPTIONS.PLOTS_CONTAINER_ID, 'Colocus_plot_group')
}

const onSwap = async () => {
  mzGridHelpers.swapCells(1,1,2,1)
}

const onSwap2 = async () => {
  mzGridHelpers.swapCells(1,1,1,2)
}

const onTogglePlot = async (args, event) => {
  console.log('togglePlot', args, event)

  // const existingPlot = mzGridHelpers.getPlotIDfromRowSlot(colocID, slot)
  //
  // if (existingPlot) {
  //   mzGridHelpers.deletePlot(existingPlot)
  // } else {
  //   await mzGridHelpers.renderPlot(colocID, signal, slot)
  //   // await scrollBottom()
  // }
}

// *** Utility functions *******************************************************
const loadPageData = async () => {
  storeMZpage.tableDataLoaded = false
  storeMZpage.colocDataReady = false
  mzGridHelpers.prepPlotSession()
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

</style>
