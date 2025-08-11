<template>
  <SidebarLayout>
    <template #sidebar>
      <FilterPanel />
    </template>

    <h1><BackButton />MultiZoom</h1>

    <p class="text-content-block">
      Colocalization of {{ s1trait }} <span class="mx-1" :style="{color: s1color}">({{ formatVariantString(s1Variant) }})</span>
      with {{ s2trait }} <span class="mx-1" :style="{color: s2color}">({{ formatVariantString(s2Variant) }})</span>.
      The y-axis of all plots is -log<sub>10</sub> p, as is the x-axis of the LZ Compare Plot.
      The x-axis of the LZ Region Plots is the location on the specified chromosome.
    </p>

    <div class="two-column-layout">
      <div class="left-panel">
        <h2>LZ Compare Plot</h2>
        <div ref="comparePlot"></div>
        <div class="ldpanel-wrapper">
          <LDPanel
            class="mt-4"
            @onCMRadioChange="onCMRadioChange"
            @onLDRadioChange="onLDRadioChange"
            @onUniqueCheckboxChange="onUniqueCheckboxChange"
            :conMarResetFlag="conMarResetFlag"
          />
        </div>
      </div>

      <div class="right-panel">
        <h2>LZ Region Plots</h2>
        <div ref="regionPlot" class="region-plot"></div>
      </div>
    </div>

    <LZSignalError />

    <h2>Data table</h2>

    <p class="my-2 text-content-block">All colocalized signals within a 500kb window centered around the lead variants (
      <span class="mx-1" :style="{color: s1color}">{{ formatVariantString(s1Variant) }}</span> and
      <span class="mx-1" :style="{color: s2color}">{{ formatVariantString(s2Variant) }}</span> )
      from the originally selected colocalized signal pair.
      <span class="font-weight-bold bg-clcTableHighlight"> Bold highlighted text </span>
      denotes the initial signals shown in the plots above.
    </p>

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
import { nextTick, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAppStore } from '@/stores/AppStore'
import { colorHasher, formatVariantString } from '@/util/util'
import { CM_DATASET, PAGE_NAMES } from '@/constants'
import { useLZPageHelpers } from '@/composables/lzPageHelpers'

// *** Composables *************************************************************
const appStore = useAppStore()
const lzPageHelpers = useLZPageHelpers()

// *** Props *******************************************************************
// *** Variables ***************************************************************
// template variables
const s1trait = ref({})
const s1Variant = ref('')
const s1color = ref('')

const s2trait = ref({})
const s2Variant = ref('')
const s2color = ref('')

// functional variables
const conMarIndicator = ref(CM_DATASET.CONDITIONAL)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
const conMarResetFlag = ref(false)

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

// managing the refs for the plot panels
const comparePlotRef = useTemplateRef('comparePlot')
const regionPlotRef = useTemplateRef('regionPlot')

// constants
const multizoomPage = PAGE_NAMES.MULTIZOOM

// blink control of lead ref marker(s) on lz plot(s)
appStore[multizoomPage].lzLeadDOMIDs.length = 0

console.log('multizoomPage entered')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore[multizoomPage].colocDataReady, (newVal) => {
  if (newVal) initializePage()
})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  loadPageData()
})

// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  const {signal1, signal2} = item
  lzPageHelpers.addPanelsForSignalPair(signal1, signal2)
  if(conMarIndicator.value === CM_DATASET.MARGINAL) {
    conMarResetFlag.value = !conMarResetFlag.value
    nextTick(() => { lzPageHelpers.toggleConditionalMarginal(CM_DATASET.CONDITIONAL, CM_DATASET.MARGINAL) })
  }
}

const onDataTableRowClick = () => {
  loadPageData()
  conMarResetFlag.value = !conMarResetFlag.value
}

const onCMRadioChange = (val) => {
  conMarIndicator.value = val
  const oldVal = val === CM_DATASET.CONDITIONAL ? CM_DATASET.MARGINAL : CM_DATASET.CONDITIONAL
  nextTick(() => { lzPageHelpers.toggleConditionalMarginal(val, oldVal) })
}

const onLDRadioChange = (variant) => {
  lzPageHelpers.applyLDref(variant)
}

const onUniqueCheckboxChange = (val) => {
  lzPageHelpers.addUniqueRefsOnly.value = val
}

// *** Utility functions *******************************************************
const initializePage = () => {
  const signal1 = appStore[multizoomPage].colocData.signal1
  const signal2 = appStore[multizoomPage].colocData.signal2

  // set template variables
  s1trait.value = signal1.analysis.trait.phenotype.name
  s1Variant.value = signal1.lead_variant.vid
  s2trait.value = signal2.analysis.trait.gene.symbol
  s2Variant.value = signal2.lead_variant.vid
  s1color.value = colorHasher.hex(s1Variant.value)
  s2color.value = colorHasher.hex(s2Variant.value)

  loadFPControls.value = !loadFPControls.value

  // build compare and region plots
  lzPageHelpers.assembleLayout(signal1, signal2, comparePlotRef, regionPlotRef)
}

const loadPageData = async () => {
  lzPageHelpers.clearRefList()
  appStore[multizoomPage].tableDataLoaded = false
  appStore[multizoomPage].colocDataReady = false
  loadTableDataFlag.value = !loadTableDataFlag.value
}
// *** Configuration data ******************************************************
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.region-plot {
  overflow-x: auto;
}

/* this updates a class from locuszoom to allow multiple spaces in a string to display as such */
:deep(.lz-panel-title) {
  white-space: pre;
}

.two-column-layout {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
}

.left-panel {
  width: 650px;
  flex-shrink: 0;
}

.right-panel {
  width: 650px;
  flex-shrink: 0;
}

.ldpanel-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
