<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox />
    </template>

    <h1><BackButton />Multizoom</h1>

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
    <div ref="plotsContainer" id="plotsContainer" class="plot-container mt-4"></div>

    <h2>Data table</h2>

    <div class="table-container mb-8">
      <DataTable
        @onDataTableRowClick="onDataTableRowClick"
        @onAddBothPlotsClick="onAddBothPlotsClick"
        @on-toggle-plot="onTogglePlot"
      ></DataTable>
    </div>
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { usePlotManager } from '@/composables/LZ2RegionPlotManager'
import { findPlotRegion } from '@/util/util'
import DataTable from "@/components/DataTable/DataTable.vue";

// *** Composables *************************************************************
const appStore = useAppStore()
const plotManager = usePlotManager()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const multizoomPage = PAGE_NAMES.MULTIZOOM
const plotsContainer = useTemplateRef('plotsContainer')
const showMenu = ref(false)

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

appStore.isToolboxShowing = true

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore[multizoomPage].colocDataReady, (newVal) => {
  if (newVal) {
    loadFPControls.value = !loadFPControls.value

    const colocID = appStore[multizoomPage].colocData.uuid
    const signal1 = appStore[multizoomPage].colocData.signal1
    const signal2 = appStore[multizoomPage].colocData.signal2

    appStore[multizoomPage].selectedLDRef = signal1.lead_variant.vid

    const x = findPlotRegion(signal1.lead_variant.pos, signal2.lead_variant.pos)
    appStore[multizoomPage].xStart = x.start
    appStore[multizoomPage].xEnd = x.end

    renderPlot(colocID, signal1, 'signal1')
    renderPlot(colocID, signal2, 'signal2')
  }
})

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(() => {
  plotManager.unmountAllPlots()
  appStore.isToolboxShowing = false
})

onMounted(() => {
  appStore.dataTable.expandedRow.length = 0
  appStore[multizoomPage].selectedTheme = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)[2]
  plotManager.unmountAllPlots()
  loadPageData()
})

// *** Event handlers **********************************************************
const onActionMenuClick = async (arg) => {
  const rect = arg.event.target.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  appStore[multizoomPage].activePlot = arg.plotID

  const spacing = 4
  const menuWidth = 225

  menuPosition.value = {
    x: rect.left + scrollX - menuWidth - spacing,
    y: rect.bottom + scrollY + spacing,
  }

  showMenu.value = true
}

const onAddBothPlotsClick = (item) => {
  const { signal1, signal2 } = item
  const colocID = item.uuid
  const MZPage = appStore[multizoomPage]
  const s1PlotID = MZPage.rowSlotToPlotID?.[colocID]?.signal1
  const s2PlotID = MZPage.rowSlotToPlotID?.[colocID]?.signal2

  if(s1PlotID && s2PlotID) {
    deletePlot(s1PlotID)
    deletePlot(s2PlotID)
  } else if(s1PlotID) {
    renderPlot(colocID, signal2, 'signal2')
  } else if(s2PlotID) {
    renderPlot(colocID, signal1, 'signal1')
  } else {
    renderPlot(colocID, signal1, 'signal1')
    renderPlot(colocID, signal2, 'signal2')
  }
}

const onCloseMenu = () => {
  showMenu.value = false
  appStore[multizoomPage].activePlot = null
}

const onDataTableRowClick = () => {
  loadPageData()
}

const onDeletePlot = () => {
  const plotID = appStore[multizoomPage].activePlot
  deletePlot(plotID)
  showMenu.value = false
}

const onExportPlot = () => {
  plotManager.exportPlotAsPNG(appStore[multizoomPage].activePlot)
  showMenu.value = false
}

const onTogglePlot = async (colocID, signal, slot) => {
  const existingPlot = appStore.getPlotID(colocID, slot)

  if (existingPlot) {
    plotManager.unmountPlot(existingPlot)
    appStore.deleteMZPlot(existingPlot)
    appStore.setRowSlotPlotID(colocID, slot, null)
  } else {
    await renderPlot(colocID, signal, slot)
  }
}

// *** Utility functions *******************************************************
const deletePlot = (plotID) => {
  plotManager.unmountPlot(plotID)
  appStore.deleteMZPlot(plotID)
}

const loadPageData = async () => {
  appStore[multizoomPage].tableDataLoaded = false
  appStore[multizoomPage].colocDataReady = false
  appStore[multizoomPage].plotSettings = {}
  loadTableDataFlag.value = !loadTableDataFlag.value
}

async function renderPlot(colocID, signal, slot) {
  const signalID = signal.uuid
  const MZPage = appStore[PAGE_NAMES.MULTIZOOM]
  const signals = appStore.getSignals()
  if(MZPage.addUniqueRefsOnly && signals.includes(signalID)) return

  const showGenSigLine = MZPage.showGenSigLines
  const showRecombLine = MZPage.showRecombLines
  const showPlotID = MZPage.showPlotID

  const plotID = await plotManager.mountPlot({
    plotsContainer,
    showGenSigLine,
    showRecombLine,
    signal,
    type: 'region',
    onActionMenuClick,
  })
  appStore.addMZPlot(plotID, showPlotID, showGenSigLine, showRecombLine, signal.lead_variant.vid, signal.uuid, colocID, slot)
  appStore.setRowSlotPlotID(colocID, slot, plotID)
  return plotID
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
