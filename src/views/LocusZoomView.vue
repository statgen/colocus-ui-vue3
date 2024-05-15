<template>
    <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
      <FilterPanel />
    </v-col>

  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
    <h1><BackButton />Locus Zoom</h1>
    <h2>Colocalization of ...</h2>
    <v-row class="ml-2">
      <v-col cols="6">
        <v-row>
          <h3>LZ Compare plot</h3>
          <div ref="comparePlotRef"></div>
        </v-row>
        <v-row>
          <h3>LD Panel</h3>
        </v-row>
      </v-col>
      <v-col>
        <h3>LZ Region plot</h3>
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
import { makePlotTitle, url } from '@/util/util'
import { normalizeMarker } from 'locuszoom/esm/helpers/parse'
import { findPlotRegion } from '@/util/util'
import LzPlot from '@/components/misc widgets/LzPLot.vue'
import { config_to_sources, get_compare_layout, get_region_layout, get_region_sources, toggle_trait } from '@/util/lz-layouts'
import { URLS } from '@/constants'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const loadFPControls = ref(false)
const loadTableDataFlag = ref(false)
// even though we don't allow user to specify gene(s) in the url on this page,
// still have to provide the variable and injection for the underlying controls
const preloadGenes = ref([])
const comparePlotRef = ref(null) //ref<HTMLElement | null>(null);

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
    buildCompareLayout()
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
const buildCompareLayout = () => {
  // console.log('buildCompareLayout:', filterStore.colocData.signal1)
  const signal1 = filterStore.colocData.signal1
  const signal2 = filterStore.colocData.signal2
  const [s1Label, s1Color] = makePlotTitle(signal1)
  const [s2Label, s2Color] = makePlotTitle(signal2)

  const variant = normalizeMarker(signal1.lead_variant.vid);
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

  const base_layout = get_compare_layout(s1Label, s2Label, initialState)
  // console.log('base_layout:', base_layout)

  const source_configs = get_region_sources(
    signal1.analysis.genome_build,
    `${URLS.SIGNALS_DATA}${signal1.uuid}/region/`,
    `${URLS.SIGNALS_DATA}${signal2.uuid}/region/`,
    `${URLS.LD_DATA}${signal1.analysis.ld}/region/`,
  );

  const explicit_sources = () => config_to_sources(source_configs) // needs to be a function for LzPlot
  // console.log('explicit_sources:', explicit_sources)

  const lzProps = {
    base_layout,
    explicit_sources,
    show_loading: true,
  }
  // console.log('lz props:', lzProps)

  const vnode = createVNode(LzPlot, lzProps)
  // console.log('vnode:', vnode)

  try {
    if(comparePlotRef.value) {
      // console.log('comparePlotRef is ready:', comparePlotRef.value)
      render(null, comparePlotRef.value)
      render(vnode, comparePlotRef.value)
    } else {
      console.log('comparePlotRef is not ready:', comparePlotRef.value)
    }
  } catch(e) {
    console.log('Render Error:', e)
  }
}

// const layout_region = get_region_layout(
//   { id: signal1.uuid, label: s1Label },
//   { id: signal2.uuid, label: s2Label },
//   initialState
// );
//
// console.log('layout region:', layout_region);

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
</style>
