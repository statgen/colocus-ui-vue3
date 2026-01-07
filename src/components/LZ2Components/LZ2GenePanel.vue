<template>
  <div
    :id="`geneplot_${plotID}`"
    ref="genePlotContainer"
    class="gene-plot-container"
    :class="{ 'overflow-state': isOverflow }"
    :style="{
      width: `${dimensions.width}px`,
      height: `${dimensions.containerHeight}px`,
      overflowY: isOverflow ? 'auto' : 'visible',
      overflowX: 'hidden'
    }"
  >
    <svg
      ref="geneSvg"
      :width="dimensions.width"
      :height="dimensions.svgHeight"
      class="gene-plot-svg"
    ></svg>
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3v7'
import { useAppStore } from '@/stores/AppStore'
import { useLZ2Renderers } from '@/composables/LZ2Renderers'
import { useLZ2DataLoaders } from '@/composables/LZ2DataLoaders'
import { COLORS, LZ2_DISPLAY_OPTIONS, PAGE_NAMES, REF_BUILD_PORTAL } from '@/constants'
import { parseVariant2 } from '@/util/util'
import { useLZ2Axes  } from '@/composables/LZ2Axes'

// *** Composables *************************************************************
const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

const lz2Axes = useLZ2Axes()
const lz2DataLoaders = useLZ2DataLoaders()
const lz2Renderers = useLZ2Renderers()

// *** Props *******************************************************************
const props = defineProps({ plotID: { type: String, required: true } })

// *** Variables ***************************************************************
const geneSvg = ref(null)
const genePlotContainer = ref(null)

// *** Computed ****************************************************************
const dimensions = computed(() => {
  const LDOD = LZ2_DISPLAY_OPTIONS.DIMENSIONS
  const width = LDOD.width
  const headerHeight = LDOD.headerHeight
  const trackHeight = LDOD.geneTrackHeight
  const minPlotHeight = 50
  const maxContainerHeight = LDOD.height
  const margin = { top: headerHeight, right: 10, bottom: 10, left: 10 }

  const numTracks = trackCount.value || 1
  const plotHeight = Math.max(minPlotHeight, numTracks * trackHeight + margin.top + margin.bottom)
  const svgHeight = plotHeight + margin.top + margin.bottom

  const containerHeight = Math.min(svgHeight, maxContainerHeight)

  return {
    containerHeight,
    headerHeight,
    height: svgHeight,
    margin,
    plotHeight,
    plotWidth: width - margin.left - margin.right,
    svgHeight,
    width,
  }
})

const geneData = computed(() => storeMZpage.geneData || [])

const isOverflow = computed(() => {
  return dimensions.value.svgHeight > dimensions.value.containerHeight
})

const genesWithTracks = computed(() => {
  if (!visibleGenes.value.length) return []

  // Sort genes by start position
  const genes = [...visibleGenes.value].sort((a, b) => a.start - b.start)

  const plotted = []
  const padding = 5000

  genes.forEach(gene => {
    let row = 1

    // Check against all previously plotted genes
    for (let i = 0; i < plotted.length; i++) {
      const g = plotted[i]

      // If this gene overlaps with a previously plotted gene
      if ((gene.start - padding < g.end + padding) &&
        (gene.end + padding > g.start - padding)) {
        row = Math.max(row, g.row + 1)
      }
    }

    gene.track = row

    // Console log to debug overlaps
    // console.log(`Gene ${gene.gene_name}: track ${row}, position ${gene.start}-${gene.end}`)

    plotted.push({
      start: gene.start,
      end: gene.end,
      row: row
    })
  })

  // console.log('Final tracks:', genes.map(g => ({ name: g.gene_name, track: g.track, start: g.start, end: g.end })))

  return genes
})

const trackCount = computed(() => {
  if (!genesWithTracks.value.length) return 0
  const n = Math.max(...genesWithTracks.value.map(g => g.track))
  return n
})

const visibleGenes = computed(() => {
  if (!geneData.value.length) return []
  // const refVariant = storeMZpage.selectedLDRef
  // const region = storeMZpage.zoomRegion
  // const pv = parseVariant2(refVariant, region)
  // if (!pv?.loc) return []
  // const center = pv.loc
  // const start = center - region, end = center + region
  const start = storeMZpage.xStart
  const end = storeMZpage.xEnd
  const vg = geneData.value.filter(gene => gene.end >= start && gene.start <= end)
  return vg
})

const xScale = computed(() => {
  const refVariant = storeMZpage.selectedLDRef
  const region = storeMZpage.zoomRegion
  const pv = parseVariant2(refVariant, region)
  if (!pv.loc) return d3.scaleLinear().domain([0, 1]).range([0, 1])
  const center = pv.loc, range = storeMZpage.zoomRegion || 250000
  return d3.scaleLinear().domain([center - range, center + range]).range([0, dimensions.value.plotWidth])
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(
  [
    () => storeMZpage.plotMoved,
    () => storeMZpage.selectedLDRef,
    () => storeMZpage.zoomRegion,
    () => storeMZpage.showPlotBorders,
    () => geneData.value,
],
  async ([]) => {
    await renderGenePlot()
}, { deep: true, immediate: false, flush: 'post' })

// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  await loadGeneData();
  await renderGenePlot()
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const loadGeneData = async () => {
  if (storeMZpage.geneData?.length > 0) return
  storeMZpage.geneData = await lz2DataLoaders.loadGeneData(storeMZpage.selectedLDRef, REF_BUILD_PORTAL, storeMZpage.zoomRegion)
}

const renderGenePlot = async () => {
  await nextTick()
  const svg = d3.select(geneSvg.value)
  svg.selectAll('*').remove()
  svg.attr('data-plot-id', props.plotID)
    .attr('data-action', 'gene-panel-background') // click on bgnd

  const borderColor = isOverflow.value ? COLORS.CLC_ACTION : LZ2_DISPLAY_OPTIONS.PLOT_BORDER_COLOR
  if(storeMZpage.showPlotBorders) lz2Renderers.renderBorder(svg, dimensions.value, borderColor)

  const title = `Genes in region (${genesWithTracks.value?.length || 0})`
  lz2Renderers.renderGeneHeader(svg, dimensions.value, title, props.plotID)

  const plotGroup = svg.append('g').attr('transform', `translate(${dimensions.value.margin.left}, ${dimensions.value.headerHeight})`)
  if(storeMZpage.showGenePanelAxis) lz2Axes.renderXaxisGenePanel(plotGroup, xScale.value, dimensions.value)
  lz2Renderers.renderGenes(plotGroup, genesWithTracks.value, xScale.value, dimensions.value)
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.gene-plot-container {
  position: relative;
  transition: border-color 0.2s;
}

.gene-plot-container.overflow-state {
  border-color: rgba(var(--v-theme-clcAction), 1.0);
}

.gene-plot-svg {
  display: block;
}
</style>
