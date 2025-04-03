<template>
  <v-col v-show="appStore.filterPanelControls.isSidebarShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>

  <v-col :cols="appStore.filterPanelControls.isSidebarShowing ? 10 : 12" class="ml-3">
    <v-row class="mt-1 ml-2">
      <h1><BackButton />Locus Zoom</h1>
    </v-row>

    <v-row class="ml-2 mb-2">
      <div class="d-flex align-center flex-nowrap">
        <p>
          Colocalization of {{ s1trait }} <span class="mx-1" :style="{color: s1color}">({{ formatVariantString(s1Variant) }})</span>
          with {{ s2trait }} <span class="mx-1" :style="{color: s2color}">({{ formatVariantString(s2Variant) }})</span>.
          The y-axis of all plots is -log<sub>10</sub> p, as is the x-axis of the LZ Compare Plot.
          The x-axis of the LZ Region Plots is the location on the specified chromosome.
        </p>
      </div>
    </v-row>

    <v-row class="ml-2 mt-2 pt-2">
      <v-col cols="6">
        <v-row>
          <h2>LZ Compare Plot</h2>
          <div ref="comparePlot"></div>
        </v-row>

        <v-row class="d-flex justify-end mb-2 mr-16">
          <LDPanel
            @onCMRadioChange="onCMRadioChange"
            @onLDRadioChange="onLDRadioChange"
            @onUniqueCheckboxChange="onUniqueCheckboxChange"
            :conMarResetFlag="conMarResetFlag"
          />
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <h2>LZ Region Plots</h2>
          <div ref="regionPlot" class="region-plot"></div>
        </v-row>

        <v-row>
          <LZSignalError />
        </v-row>
      </v-col>
    </v-row>

    <v-row class="ml-2">
      <v-col cols="12">
        <v-row>

          <h2>
            <ToolTippy>
              <v-icon icon="mdi-help-circle-outline" size="1.5rem" class="text-clcAction mb-1" />
              <template #tooltipContent>
                If you want to...
              </template>
            </ToolTippy>

            Data table
          </h2>
        </v-row>

        <v-row>
          <p class="my-2">All colocalized signals within a 500kb window centered around the lead variants (
            <span class="mx-1" :style="{color: s1color}">{{ formatVariantString(s1Variant) }}</span> and
            <span class="mx-1" :style="{color: s2color}">{{ formatVariantString(s2Variant) }}</span> )
            from the originally selected colocalized signal pair.
            <span class="font-weight-bold bg-clcTableHighlight"> Bold highlighted text </span>
            denotes the initial signals shown in the plots above.
          </p>
        </v-row>

        <v-row>
          <div class="table-container mb-8">
            <DataTable
              @onDataTableRowClick="onDataTableRowClick"
              @onAddPlotIconClick="onAddPlotIconClick"
            ></DataTable>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { nextTick, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
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
const locuszoomPage = PAGE_NAMES.LOCUSZOOM

// blink control of lead ref marker(s) on lz plot(s)
appStore[locuszoomPage].lzLeadDOMIDs.length = 0

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore[locuszoomPage].colocDataReady, (newVal) => {
  if (newVal) initializePage()
})

watch(() => conMarIndicator.value, (newVal, oldVal) => {
  lzPageHelpers.toggleConditionalMarginal(newVal, oldVal)
  // nextTick(() => { lzPageHelpers.toggleConditionalMarginal(newVal, oldVal) })
  // setTimeout(() => {
  //   lzPageHelpers.toggleConditionalMarginal(newVal, oldVal)
  // }, 500)
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
    conMarIndicator.value = CM_DATASET.CONDITIONAL
  }
}

const onDataTableRowClick = () => {
  loadPageData()
  conMarResetFlag.value = !conMarResetFlag.value
}

const onCMRadioChange = (val) => {
  conMarIndicator.value = val
}

const onLDRadioChange = (variant) => {
  lzPageHelpers.applyLDref(variant)
}

const onUniqueCheckboxChange = (val) => {
  lzPageHelpers.addUniqueRefsOnly.value = val
}

// *** Utility functions *******************************************************
const initializePage = () => {
  const signal1 = appStore[locuszoomPage].colocData.signal1
  const signal2 = appStore[locuszoomPage].colocData.signal2

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
  appStore[locuszoomPage].tableDataLoaded = false
  appStore[locuszoomPage].colocDataReady = false
  loadTableDataFlag.value = !loadTableDataFlag.value
}
// *** Configuration data ******************************************************
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}

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
</style>
