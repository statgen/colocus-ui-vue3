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
        @onAddPlotIconClick="onAddPlotIconClick"
      ></DataTable>
    </div>
  </SidebarLayout>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { usePlotManager } from '@/composables/LZ2RegionPlotManager'
import { findPlotRegion } from '@/util/util'

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
const uniqueSignals = computed(() => {
  const signals = Object.values(appStore[multizoomPage].plotSettings).map(v => v.signalID)
  return [...new Set(signals)]
})

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
    const signal1 = appStore[multizoomPage].colocData.signal1
    const signal2 = appStore[multizoomPage].colocData.signal2
    appStore[multizoomPage].selectedLDRef = signal1.lead_variant.vid
    const x = findPlotRegion(signal1.lead_variant.pos, signal2.lead_variant.pos)
    appStore[multizoomPage].xStart = x.start
    appStore[multizoomPage].xEnd = x.end

    renderPlot(signal1, theme)
    renderPlot(signal2, theme)
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
  const s1ID = signal1.uuid
  const s2ID = signal2.uuid
  const uniques = uniqueSignals.value
  const theme = appStore[multizoomPage].selectedTheme
  if(!appStore[multizoomPage].addUniqueRefsOnly || !uniques.includes(s1ID)) renderPlot(signal1, theme)
  if(!appStore[multizoomPage].addUniqueRefsOnly || !uniques.includes(s2ID)) renderPlot(signal2, theme)
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
  appStore[multizoomPage].plotSettings = {}
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
  appStore.addMZPlot(plotID, showGenSigLine, showRecombLine, signal.lead_variant.vid, signal.uuid)
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
