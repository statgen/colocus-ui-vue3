<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <h1><BackButton />Multi Zoom</h1>

    <div class="d-flex align-center flex-wrap ga-2 mt-2">
      <v-select
        v-model="selectedTheme"
        :items="themes"
        style="max-width: 200px"
        @update:model-value="onSelectTheme"
        label="Select theme"
        variant="outlined"
        hide-details
        density="compact"
      ></v-select>
      <v-btn @click="unmountAllPlots">Clear all</v-btn>
      <v-btn @click="onBlinkButtonClick">Blink</v-btn>
    </div>
    <LZ2Tooltip />
    <LZ2ActionMenu
      v-if="showMenu"
      :menu-style="{
        position: 'absolute',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`
      }"
      @delete-plot="onDeletePlot"
      @toggle-gen-sig-line="onToggleGenSig"
      @toggle-recomb-line="onToggleRecombLine"
      @export-plot="onExportPlot"
      @close-menu="showMenu = false"
    />
    <div ref="plotsContainer" class="plot-container mt-4"></div>

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
const BLINK_TIME = 5
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const multizoomPage = PAGE_NAMES.MULTIZOOM
const plotsContainer = useTemplateRef('plotsContainer')
const selectedTheme = ref()
const showMenu = ref(false)
const themes = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

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
    const theme = selectedTheme.value
    renderPlot(appStore[multizoomPage].colocData.signal1, theme)
    renderPlot(appStore[multizoomPage].colocData.signal2, theme)
  }
})

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(() => {
  plotManager.unmountAllPlots()
})

onMounted(() => {
  appStore.dataTable.expandedRow.length = 0
  selectedTheme.value = Object.keys(LZ2_DISPLAY_OPTIONS.LZ2_THEMES)[1]
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
  const theme = selectedTheme.value
  renderPlot(signal1, theme)
  renderPlot(signal2, theme)
}

const onBlinkButtonClick = () => {
  document.querySelectorAll('.lead-variant')
    .forEach(el => {el?.classList.add('blink')})
  setTimeout(() => {
    document.querySelectorAll('.lead-variant')
      .forEach(el => {el?.classList.remove('blink')})
  }, BLINK_TIME * 1000)
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

const onSelectTheme = (newValue) => {
  selectedTheme.value = newValue
}

const onToggleGenSig = () => {
  console.log('onToggleGenSig')
  showMenu.value = false
}

const onToggleRecombLine = () => {
  console.log('onToggleRecomb')
  showMenu.value = false
}

const unmountAllPlots = () => {
  plotManager.unmountAllPlots()
}

// *** Utility functions *******************************************************
const loadPageData = async () => {
  appStore[multizoomPage].tableDataLoaded = false
  appStore[multizoomPage].colocDataReady = false
  loadTableDataFlag.value = !loadTableDataFlag.value
}

const renderPlot = async(signal, theme) => {
  const plotID = await plotManager.mountPlot({
    plotsContainer,
    signal,
    type: 'region',
    theme,
    onActionMenuClick,
  })
  appStore.addMZPlot(plotID)
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
