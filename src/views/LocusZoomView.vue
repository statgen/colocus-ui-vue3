<template>
  <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
    <FilterPanel />
  </v-col>

  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-3">
    <v-row class="mt-1 ml-2">
      <h1><BackButton />Locus Zoom</h1>
    </v-row>

    <v-row class="ml-2 mb-2">
      <div class="d-flex align-center flex-nowrap">
        Colocalization of {{ s1trait }} <span class="mx-1" :style="{color: s1color}">({{ formatVariantString(s1Variant) }})</span>
        with {{ s2trait }} <span class="mx-1" :style="{color: s2color}">({{ formatVariantString(s2Variant) }})</span>.
        The y-axis of all plots is -log<sub>10</sub> p, as is the x-axis of the LZ Compare Plot.
      </div>
    </v-row>

    <v-row class="ml-2 mt-2 pt-2">
      <v-col cols="6">
        <v-row>
          <h2>LZ Compare Plot</h2>
          <div ref="comparePlotRef"></div>
        </v-row>

        <v-row class="d-flex justify-end mb-2 mr-16">
          <LDPanel
            @onCMRadioChange="onCMRadioChange"
            @onLDRadioChange="onLDRadioChange"
            @onUniqueCheckboxChange="onUniqueCheckboxChange"
            :regionPanelRemoved="regionPanelRemoved"
          />
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row>
          <h2>LZ Region Plots</h2>
          <div ref="regionPlotRef" class="region-plot"></div>
        </v-row>

        <v-row>
          <LZSignalError />
        </v-row>
      </v-col>
    </v-row>

    <v-row class="ml-2">
      <v-col cols="12">
        <v-row>
          <h2>Data table</h2>
        </v-row>

        <v-row>
          <p class="my-2">All colocalized signals within a 500kb window centered around the lead variants (
            <span class="mx-1" :style="{color: s1color}">{{ formatVariantString(s1Variant) }}</span> and
            <span class="mx-1" :style="{color: s2color}">{{ formatVariantString(s2Variant) }}</span> )
            from the originally selected colocalized signal pair.
            <span class="font-weight-bold bg-clcTableHighlight"> Bold denotes </span>the initial signals shown in the plots above.
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
import { createVNode, nextTick, onMounted, provide, ref, render, watch } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'
import { colorHasher, findPlotRegion, formatVariantString, makePlotTitle, url } from '@/util/util'
import { normalizeMarker } from 'locuszoom/esm/helpers/parse'
import LZPlot from '@/components/misc widgets/LZPLot.vue'
import {
  config_to_sources,
  get_compare_layout,
  get_region_layout,
  get_region_sources,
  toggle_trait
} from '@/util/lz-layouts'
import {AXIS_OPTIONS, URLS} from '@/constants'
import * as d3 from 'd3'
import {useLDRefs} from '@/composables/ldRefs'

// *** Composables *************************************************************
const filterStore = useFilterStore()
const ldRefs = useLDRefs()

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
let addUniquesOnly = false
const conMarIndicator = ref(AXIS_OPTIONS.CONDITIONAL)
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)

// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the preloadGenes variable for the underlying controls
const preloadGenes = ref([])

const regionPanelRemoved = ref(false)

// managing the refs and vnodes for the plot panels
const comparePlotRef = ref(null)
let compareVnodeRef = null

const regionPlotRef = ref(null)
let regionVnodeRef = null

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => filterStore.colocDataReady, async (newVal) => {
  if (newVal) {
    // console.log('watch: coloc data ready flag true; comparePlotRef:', comparePlotRef.value)

    // set template variables
    s1trait.value = filterStore.colocData.signal1.analysis.trait.phenotype.name
    s1Variant.value = filterStore.colocData.signal1.lead_variant.vid
    s2trait.value = filterStore.colocData.signal2.analysis.trait.gene.symbol
    s2Variant.value = filterStore.colocData.signal2.lead_variant.vid
    s1color.value = colorHasher.hex(s1Variant.value)
    s2color.value = colorHasher.hex(s2Variant.value)

    // addLDRef(filterStore.colocData.signal1.lead_variant.vid)
    // addLDRef(filterStore.colocData.signal2.lead_variant.vid)

    // build the plots
    buildCompareLayout()
    buildRegionLayout()
  }
})

watch(() => conMarIndicator.value, (newVal, oldVal) => {
  // console.log('oldVal', oldVal, 'newVal', newVal)
  const lzregion = regionVnodeRef.component.exposed
  // console.log('lzregion:', lzregion)

  if (!lzregion) throw new Error('lzregion not found')

  lzregion.callPlot((plot) => {
    try {
      toggle_trait(plot.layout, 'assoc', oldVal, newVal)
    } catch (e) {
      console.error('error from region toggle_trait:', e)
    }
    try {
      plot.applyState()
    } catch (e) {
      console.error('error applying state to region plot:', e)
    }
  })

  const lzcompare = compareVnodeRef.component.exposed

  lzcompare.callPlot((plot) => {
    try {
      toggle_trait(plot.layout, 'trait1', oldVal, newVal)
    } catch (e) {
      console.error('error from compare toggle_trait trait1:', e)
    }
    try {
      toggle_trait(plot.layout, 'trait2', oldVal, newVal)
    } catch (e) {
      console.error('error from compare toggle_trait trait2:', e)
    }
    try {
      plot.applyState()
    } catch (e) {
      console.error('error applying state to compare plot:', e)
    }
  })

})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  // console.log('lz view onmounted, comparePlotRef:', comparePlotRef)
  filterStore.lzPageTableDataLoaded = false
  loadFilterControls()
  loadData()
})

// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  // console.log('plot icon click', item)
  const {signal1, signal2} = item
  const s1id = signal1.uuid
  const s2id = signal2.uuid
  const lzregion = regionVnodeRef.component.exposed

  if (!addUniquesOnly || !ldRefs.signalExists(s1id)) lzregion.addPanel(signal1)
  if (!addUniquesOnly || !ldRefs.signalExists(s2id)) lzregion.addPanel(signal2)
}

const onDataTableRowClick = () => {
  loadData()
}

const onCMRadioChange = (val) => {
  // console.log('onCMRadioChange:', val)
  conMarIndicator.value = val
}

const onLDRadioChange = (variant) => {
  // console.log('ld radio changed')
  updateLDref(variant)
}

const onUniqueCheckboxChange = (val) => {
  addUniquesOnly = val
}

// *** Utility functions *******************************************************
const buildLZProps = (plotType) => {
  const signal1 = filterStore.colocData.signal1
  const signal2 = filterStore.colocData.signal2
  const [s1Label, s1Color] = makePlotTitle(signal1)
  const [s2Label, s2Color] = makePlotTitle(signal2)

  const variant = normalizeMarker(signal1.lead_variant.vid)
  const chr = signal1.lead_variant.chrom
  const {start, end} = findPlotRegion(signal1.lead_variant.pos, signal2.lead_variant.pos)
  // console.log('chr, start, end, variant:', chr, start, end, variant)

  const initialState = {
    chr,
    start,
    end,
    ldrefvar: variant,
  }
  // console.log(`s1Label: ${s1Label}, s2Label: ${s2Label} initialState:`, initialState)

  let base_layout
  if (plotType === 'compare') {
    base_layout = get_compare_layout(s1Label, s2Label, initialState)
  } else if (plotType === 'region') {
    base_layout = get_region_layout(
      {id: signal1.uuid, label: s1Label},
      {id: signal2.uuid, label: s2Label},
      initialState)
    setPanelTitle(base_layout, s1Label, s1Color, 'trait1')
    setPanelTitle(base_layout, s2Label, s2Color, 'trait2')
    // console.log('Panel1/signal1:', base_layout.panels[0].id, signal1.lead_variant.vid)
    // console.log('Panel2/signal2:', base_layout.panels[1].id, signal2.lead_variant.vid)
    ldRefs.addRef({signalID: signal1.uuid, panelID: base_layout.panels[0].id, variantID: signal1.lead_variant.vid})
    ldRefs.addRef({signalID: signal2.uuid, panelID: base_layout.panels[1].id, variantID: signal2.lead_variant.vid})
  } else throw new Error("Invalid plot type specified")

  const source_configs = get_region_sources(
    signal1.analysis.genome_build,
    `${URLS.SIGNALS_DATA}${signal1.uuid}/region/`,
    `${URLS.SIGNALS_DATA}${signal2.uuid}/region/`,
    `${URLS.LD_DATA}${signal1.analysis.ld}/region/`,
  )

  const explicit_sources = () => config_to_sources(source_configs) // needs to be a function for LZPlot

  return {
    base_layout,
    explicit_sources,
    show_loading: true,
  }
}

const buildCompareLayout = () => {
  // console.log('buildCompareLayout:', filterStore.colocData.signal1)

  const lzProps = buildLZProps('compare')
  // console.log('lz props:', lzProps)
  compareVnodeRef = createVNode(LZPlot, lzProps)
  // console.log('vnode:', vnode)

  try {
    // console.log('comparePlotRef is ready:', comparePlotRef.value)
    render(null, comparePlotRef.value)
    render(compareVnodeRef, comparePlotRef.value)

    nextTick(() => {
      requestAnimationFrame(() => {
        // Select and style the axis labels
        d3.selectAll('.lz-x .lz-label').style('fill', s2color.value).style('font-weight', 'normal').style('font-size', '1.0rem')
        d3.selectAll('.lz-y .lz-label').style('fill', s1color.value).style('font-weight', 'normal').style('font-size', '1.0rem')
      })
    })
  } catch (e) {
    console.error('LZ Compare plot render error:', e)
  }
}

const buildRegionLayout = () => {
  // console.log('buildRegionLayout:', filterStore.colocData.signal1)

  const lzProps = buildLZProps('region')
  // console.log('lz props:', lzProps)
  regionVnodeRef = createVNode(LZPlot, {
    ...lzProps,
    onRegionPanelRemoved: (eventData) => {
      if (eventData.data === 'genes') return // it was a gene panel, nothing to do
      ldRefs.removePanelRef(eventData)
      const variant = filterStore.ldRefs[0]
      updateLDref(variant)
      regionPanelRemoved.value = !regionPanelRemoved.value
    },
    onRegionPanelAdded: (eventData) => {
      // console.log('LZ panel added:', eventData)
      ldRefs.addRef(eventData)
    }
  })
  // console.log('vnode:', vnode)

  try {
    render(null, regionPlotRef.value)
    render(regionVnodeRef, regionPlotRef.value)
  } catch (e) {
    console.error('LZ Region plot render error:', e)
  }
}

const loadFilterControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadData = () => {
  filterStore.colocDataReady = false
  loadTableDataFlag.value = !loadTableDataFlag.value
}

function setPanelTitle(layout, title, color, trait) {
  layout.panels.forEach((panel) => {
    if (panel.data_layers) {
      panel.data_layers.forEach((layer) => {
        if (layer.namespace && layer.namespace.assoc === trait) {
          panel.title = {text: title, style: {fill: color, 'font-size': '1.0rem', 'font-weight': 'normal'}}
        }
      })
    }
  })
}

const updateLDref = (variant) => {
  const marker = normalizeMarker(variant)

  const lzregion = regionVnodeRef.component.exposed
  const lzcompare = compareVnodeRef.component.exposed

  lzcompare.callPlot((plot) => plot.applyState({ldrefvar: marker}))
  lzregion.callPlot((plot) => plot.applyState({ldrefvar: marker}))
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
