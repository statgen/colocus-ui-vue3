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
        Colocalization of {{ s1trait }} <span class="mx-1" :style="{color: s1color}">({{ s1vid }})</span>
        with {{ s2trait }} <span class="mx-1" :style="{color: s2color}">({{ s2vid }})</span>
      </div>
    </v-row>
    <v-row class="ml-2 mt-2">
      <v-col cols="6">
        <v-row>
          <h2>LZ Compare plot</h2>
          <div ref="comparePlotRef"></div>
        </v-row>
        <v-row>
          <h3>LD Panel</h3>
        </v-row>
      </v-col>
      <v-col cols="6">
        <h2>LZ Region plot</h2>
        <div ref="regionPlotRef" class="region-plot"></div>
      </v-col>
    </v-row>
    <v-row class="ml-2">
      <v-col cols="12">
      <v-row><h2>All colocalized signals in region</h2></v-row>
      <v-row><p>Colocalized signals within a 500kb window centered around the lead variants...</p></v-row>
      <v-row>
        <h3>Data table</h3>
        <div class="table-container">
          <DataTable
            @row-click="onTableRowClick"
          ></DataTable>
        </div>
        <p class="mt-8">
          <span class="font-weight-bold">Bold</span> denotes the signals currently being shown in the plots above.
        </p>
      </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { createVNode, nextTick, onMounted, provide, ref, render, toRaw, watch } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'
import { colorHasher, makePlotTitle, url } from '@/util/util'
import { normalizeMarker } from 'locuszoom/esm/helpers/parse'
import { findPlotRegion } from '@/util/util'
import LzPlot from '@/components/misc widgets/LzPLot.vue'
import { config_to_sources, get_compare_layout, get_region_layout, get_region_sources, toggle_trait } from '@/util/lz-layouts'
import { URLS } from '@/constants'
import * as d3 from 'd3'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
// template variables
const s1trait = ref({})
const s1vid = ref({})
const s2trait = ref({})
const s2vid = ref({})
const s1color = ref('')
const s2color = ref('')

// functional variables
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the variable and injection for the underlying controls
const preloadGenes = ref([])
const comparePlotRef = ref(null) //ref<HTMLElement | null>(null);
const regionPlotRef = ref(null)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
provide('loadFPControls', loadFPControls)
provide('loadTableDataFlag', loadTableDataFlag)
provide('preloadGenes', preloadGenes)

// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => filterStore.colocDataReady, async (newVal) => {
  if(newVal) {
    // console.log('watch: coloc data ready flag true; comparePlotRef:', comparePlotRef.value)
    // set template variables
    s1trait.value = filterStore.colocData.signal1.analysis.trait.phenotype.name
    s1vid.value = filterStore.colocData.signal1.lead_variant.vid
    s2trait.value = filterStore.colocData.signal2.analysis.trait.gene.symbol
    s2vid.value = filterStore.colocData.signal2.lead_variant.vid
    s1color.value = colorHasher.hex(s1vid.value)
    s2color.value = colorHasher.hex(s2vid.value)

    // build the plots
    buildCompareLayout()
    buildRegionLayout()
  }
})

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  // console.log('lz view onmounted, comparePlotRef:', comparePlotRef)
  filterStore.lzPageTableDataLoaded = false
  loadFilterControls()
  loadData()
})

// *** Event handlers **********************************************************
// const onTableRowClick = () => console.log('zzz')
const onTableRowClick = () => {
  loadData()
}

// *** Utility functions *******************************************************
function setPanelTitle(layout, title, color, trait) {
  layout.panels.forEach((panel) => {
    if (panel.data_layers) {
      panel.data_layers.forEach((layer) => {
        if (layer.namespace && layer.namespace.assoc === trait) {
          panel.title = { text: title, style: { fill: color, 'font-size': '1.1rem', 'font-weight': 'normal' } };
        }
      });
    }
  });
}

const buildLZProps = (plotType) => {
  const signal1 = filterStore.colocData.signal1
  const signal2 = filterStore.colocData.signal2
  const [s1Label, s1Color] = makePlotTitle(signal1)
  const [s2Label, s2Color] = makePlotTitle(signal2)

  const variant = normalizeMarker(signal1.lead_variant.vid) // FIXME
  const chr = signal1.lead_variant.chrom
  const { start, end } = findPlotRegion(signal1.lead_variant.pos, signal2.lead_variant.pos)
  // console.log('chr, start, end, variant:', chr, start, end, variant)

  const initialState = {
    chr,
    start,
    end,
    ldrefvar: variant,
  };
  // console.log(`s1Label: ${s1Label}, s2Label: ${s2Label} initialState:`, initialState)

  let base_layout
  if(plotType === 'compare') {
    base_layout = get_compare_layout(s1Label, s2Label, initialState)
  } else if(plotType === 'region') {
    base_layout = get_region_layout(
     { id: signal1.uuid, label: s1Label },
     { id: signal2.uuid, label: s2Label },
      initialState)
    setPanelTitle(base_layout, s1Label, s1Color, 'trait1')
    setPanelTitle(base_layout, s2Label, s2Color, 'trait2')
  } else throw new Error ("Invalid plot type specified")
  // console.log('base_layout:', base_layout)


  const source_configs = get_region_sources(
    signal1.analysis.genome_build,
    `${URLS.SIGNALS_DATA}${signal1.uuid}/region/`,
    `${URLS.SIGNALS_DATA}${signal2.uuid}/region/`,
    `${URLS.LD_DATA}${signal1.analysis.ld}/region/`,
  );

  const explicit_sources = () => config_to_sources(source_configs) // needs to be a function for LzPlot
  // console.log('explicit_sources:', explicit_sources)

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
  const vnode = createVNode(LzPlot, lzProps)
  // console.log('vnode:', vnode)

  try {
    // console.log('comparePlotRef is ready:', comparePlotRef.value)
    render(null, comparePlotRef.value)
    render(vnode, comparePlotRef.value)

    nextTick(() => {
      requestAnimationFrame(() => {
        // Select and style the axis labels
        d3.selectAll('.lz-x .lz-label').style('fill', s2color.value).style('font-weight', 'normal').style('font-size', '1.1rem')
        d3.selectAll('.lz-y .lz-label').style('fill', s1color.value).style('font-weight', 'normal').style('font-size', '1.1rem')
      });
    });
  } catch(e) {
    console.log('LZ Compare plot render error:', e)
  }
}

const buildRegionLayout = () => {
  // console.log('buildRegionLayout:', filterStore.colocData.signal1)

  const lzProps = buildLZProps('region')
  // console.log('lz props:', lzProps)
  const vnode = createVNode(LzPlot, lzProps)
  // console.log('vnode:', vnode)

  try {
    // if(regionPlotRef.value) {
      // console.log('regionPlotRef is ready:', regionPlotRef.value)
      render(null, regionPlotRef.value)
      render(vnode, regionPlotRef.value)
    // } else {
    //   console.log('comparePlotRef is not ready:', regionPlotRef.value)
    // }
  } catch(e) {
    console.log('LZ Region plot render error:', e)
  }
}

const loadFilterControls = () => {
  loadFPControls.value = !loadFPControls.value
}

const loadData = () => {
  filterStore.colocDataReady = false
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
</style>
