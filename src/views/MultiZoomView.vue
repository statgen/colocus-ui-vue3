<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox />
    </template>

    <h1><BackButton />MultiZoom</h1>

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
        @onAddPlotIconClick="onAddPlotIconClick"
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
    const theme = appStore[multizoomPage].selectedTheme
    renderPlot(appStore[multizoomPage].colocData.signal1, theme)
    renderPlot(appStore[multizoomPage].colocData.signal2, theme)
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

const onAddPlotIconClick = (item) => {
  const { signal1, signal2 } = item
  const theme = appStore[multizoomPage].selectedTheme
  renderPlot(signal1, theme)
  renderPlot(signal2, theme)
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
  plotManager.unmountPlot(`plot_${plotID}`)
  appStore.deleteMZPlot(plotID)
  showMenu.value = false
}

const onExportPlot = () => {
  plotManager.exportPlotAsPNG(`plot_${appStore[multizoomPage].activePlot}`)
  showMenu.value = false
}

// *** Utility functions *******************************************************
const loadPageData = async () => {
  appStore[multizoomPage].tableDataLoaded = false
  appStore[multizoomPage].colocDataReady = false
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const renderPlot = async(signal) => {
  const showGenSigLine = appStore[multizoomPage].showGenSigLines
  const showRecombLine = appStore[multizoomPage].showRecombLines
  const plotID = await plotManager.mountPlot({
    plotsContainer,
    showGenSigLine,
    showRecombLine,
    signal,
    type: 'region',
    onActionMenuClick,
  })
  appStore.addMZPlot(plotID, showGenSigLine, showRecombLine)
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
