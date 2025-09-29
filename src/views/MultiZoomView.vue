<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <template #toolbox>
      <MZToolbox @export-plot-group="onExportPlotGroup"/>
    </template>

    <h1><BackButton />Multizoom</h1>

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
import { useMZPageHelpers } from '@/composables/MZPageHelpers'
import { parseVariant2 } from '@/util/util'
import DataTable from "@/components/DataTable/DataTable.vue"
import html2canvas from 'html2canvas'

// *** Composables *************************************************************
const appStore = useAppStore()
const plotManager = usePlotManager()
const mzPageHelpers = useMZPageHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const isExporting = ref(false)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const multizoomPage = PAGE_NAMES.MULTIZOOM
const MZPage = appStore[multizoomPage]
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
watch(() => MZPage.colocDataReady, (newVal) => {
  if (newVal) {
    loadFPControls.value = !loadFPControls.value

    const colocID = MZPage.colocData.uuid
    const signal1 = MZPage.colocData.signal1
    const signal2 = MZPage.colocData.signal2

    MZPage.selectedLDRef = signal1.lead_variant.vid

    const variant = signal1.lead_variant.vid
    MZPage.signal1Variant = variant
    mzPageHelpers.setPlotRegion(variant, MZPage.zoomRegion)

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
  MZPage.selectedTheme = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)[2]
  plotManager.unmountAllPlots()
  loadPageData()
})

// *** Event handlers **********************************************************
const onActionMenuClick = async (arg) => {
  const rect = arg.event.target.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  MZPage.activePlotID = arg.plotID

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
  MZPage.activePlotID = null
}

const onDataTableRowClick = () => {
  loadPageData()
}

const onDeletePlot = () => {
  const plotID = MZPage.activePlotID
  deletePlot(plotID)
  showMenu.value = false
}

const onExportPlot = async () => {
  const plotDOMid = `plot_${MZPage.activePlotID}`
  await exportPlotContainer(plotDOMid, `Colocus_${plotDOMid}`)
  showMenu.value = false
}

const onExportPlotGroup = async () => {
  await exportPlotContainer('plotsContainer', 'Colocus_plot_group')
}

const onTogglePlot = async (colocID, signal, slot) => {
  const existingPlot = mzPageHelpers.getMZPlotID(colocID, slot)

  if (existingPlot) {
    plotManager.unmountPlot(existingPlot)
    mzPageHelpers.deleteMZPlot(existingPlot)
    mzPageHelpers.setMZRowSlotPlotID(colocID, slot, null)
  } else {
    await renderPlot(colocID, signal, slot)
  }
}

// *** Utility functions *******************************************************
const deletePlot = (plotID) => {
  plotManager.unmountPlot(plotID)
  mzPageHelpers.deleteMZPlot(plotID)
}

const exportPlotContainer = async (elID, fileName) => {
  const el = document.getElementById(elID)
  if (!el) return
  if(Object.keys(MZPage.plotSettings).length < 1) return

  isExporting.value = true
  setTimeout(async () => {
    try {
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: '#ffffff' })
      const blob = await new Promise(res => canvas.toBlob(res))
      if (!blob) return
      const url = URL.createObjectURL(blob)
      try {
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.png`
        a.style.display = 'none'
        document.body.appendChild(a)   // helps Firefox reliability
        a.click()
        a.remove()                      // cleanup the DOM node
      } finally {
        // delay revocation so some browsers don’t cancel the download
        setTimeout(() => URL.revokeObjectURL(url), 0)
      }
    } finally {
      isExporting.value = false
    }
  }, 0)
}

const loadPageData = async () => {
  MZPage.tableDataLoaded = false
  MZPage.colocDataReady = false
  MZPage.plotSettings = {}
  loadTableDataFlag.value = !loadTableDataFlag.value
}

async function renderPlot(colocID, signal, slot) {
  const signalID = signal.uuid
  const signals = mzPageHelpers.getMZSignals()
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
  mzPageHelpers.addMZPlot(plotID, showPlotID, showGenSigLine, showRecombLine, signal.lead_variant.vid, signal.uuid, colocID, slot)
  mzPageHelpers.setMZRowSlotPlotID(colocID, slot, plotID)
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
