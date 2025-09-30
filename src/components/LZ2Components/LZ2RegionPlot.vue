<template>
    <div ref="plotContainer" :id="plotDOMid" class="plot-container" :style="{ backgroundColor: plotBackgroundColor }"/>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, defineEmits, nextTick, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import * as d3 from 'd3v7'
import { useLZ2TooltipStore } from '@/stores/LZ2TooltipStore'
import { makePlotTitle, parseVariant2 } from '@/util/util'
import { LZ2_DISPLAY_OPTIONS, REF_BUILD, REF_BUILD_PORTAL } from '@/constants'
import { useLZ2Containers } from '@/composables/LZ2Containers'
import { useLZ2Scales } from '@/composables/LZ2Scales'
import { useLZ2DataLoaders  } from '@/composables/LZ2DataLoaders'
import { useLZ2Axes  } from '@/composables/LZ2Axes'
import { useLZ2Renderers } from '@/composables/LZ2Renderers'
import { useAppStore } from '@/stores/AppStore'
import {PAGE_NAMES} from "@/constants";
import { debounce } from 'lodash'

// *** Composables *************************************************************
const appStore = useAppStore()
const tooltipStore = useLZ2TooltipStore()

const LZ2Containers = useLZ2Containers()
const LZ2Scales = useLZ2Scales()
const LZ2DataLoaders = useLZ2DataLoaders()
const LZ2Axes = useLZ2Axes()
const LZ2Renderers = useLZ2Renderers()

const tooltipCallbacks = {
  show: tooltipStore.showTooltip,
  updatePosition: tooltipStore.updatePosition,
  hide: tooltipStore.hideTooltip
}

const emit = defineEmits(['action-menu-click'])

// *** Props *******************************************************************
const props = defineProps({
  ID: Number,
  showGenSigLine: Boolean,
  showRecombLine: Boolean,
  signal: Object,
})

// *** Variables ***************************************************************
const PLOT_DEBOUNCE_DELAY = 50
const leadVariant = props.signal.lead_variant.vid
const signalUUID = props.signal.uuid
const title = ref('')
const titleColor = ref('')

const plotContainer = useTemplateRef('plotContainer')
const rootSVG = ref(null)

const signalData = ref(null)
const recombData = ref(null)

const DIMENSIONS = LZ2_DISPLAY_OPTIONS.DIMENSIONS

const plotBackgroundColor = LZ2_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR
const MZPage = appStore[PAGE_NAMES.MULTIZOOM]

// *** Computed ****************************************************************
const plotDOMid = computed(() => `plot_${props.ID}`)

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// this watch rerenders following data reload or certain boolean UI changes (eg, showPlotID)
watch([
    () => signalData.value,
    () => recombData.value,
    () => MZPage.plotSettings[props.ID]?.showPlotID,
    () => MZPage.plotSettings[props.ID]?.showRecombLine,
    () => MZPage.plotSettings[props.ID]?.showGenSigLine,
    () => MZPage.selectedTheme,
  ],
async ([signalData, recombData, showPlotID, showRecombLine, showGenSigLine, theme]) => {
      if (!Array.isArray(signalData) || !Array.isArray(recombData) || !plotContainer.value) return
      plotContainer.value.querySelectorAll('.recomb-group').forEach(n => {
        n.classList.toggle('hidden', !showRecombLine)
      })
      plotContainer.value.querySelectorAll('.gensig-group').forEach(n => {
        n.classList.toggle('hidden', !showGenSigLine)
      })
      await nextTick()
      const region = MZPage.zoomRegion
      const plotID = props.ID
      const selectedLDRef = MZPage.selectedLDRef
      debouncedRenderPlot({plotID, leadVariant, signalData, recombData, showPlotID, showGenSigLine, showRecombLine, theme, region, selectedLDRef})
    },
  { immediate: false, flush: 'post' }
)

// this watch reloads data following UI changes, depending on the other watch to rerender plot
watch([
  () => MZPage.selectedLDRef,
  () => MZPage.yAxis,
  () => MZPage.zoomRegion,
],
  async ([selectedLDRef, yAxis, zoomRegion]) => {
    signalData.value = await LZ2DataLoaders.loadSignalData(leadVariant, signalUUID, selectedLDRef, REF_BUILD, yAxis, zoomRegion)
    await nextTick()
  },
  { immediate: true }
)

// *** Lifecycle hooks *********************************************************
onBeforeUnmount(() => {
  debouncedRenderPlot.cancel() // prevent late renders after unmount
  d3.select(plotContainer.value).selectAll('*').remove()
})

onMounted(async () => {
  const [t, c] = makePlotTitle(props.signal)
  title.value = t
  titleColor.value = c
  const ldRef = MZPage.selectedLDRef
  const yAxis = MZPage.yAxis
  const zoomRegion = MZPage.zoomRegion
  signalData.value = await LZ2DataLoaders.loadSignalData(leadVariant, signalUUID, ldRef, REF_BUILD, yAxis, zoomRegion)
  recombData.value = await LZ2DataLoaders.loadRecombData(leadVariant, REF_BUILD_PORTAL, zoomRegion)
})

// *** Event handlers **********************************************************
const onActionMenuClick = (event) => {
  emit('action-menu-click', {plotID: props.ID, event})
}

// *** Utility functions *******************************************************
const debouncedRenderPlot = debounce(async (args) => {
  const {plotID, leadVariant, signalData, recombData, showPlotID, showGenSigLine, showRecombLine, theme, region, selectedLDRef} = args

  await nextTick()
  renderPlot(plotID, leadVariant, signalData, showPlotID, recombData, showGenSigLine, showRecombLine, theme, region, selectedLDRef)
}, PLOT_DEBOUNCE_DELAY, { leading: false, trailing: true, maxWait: 200 })

const renderPlot = (plotID, leadVariant, signalData, showPlotID, recombData, showGenSigLine, showRecombLine, theme, region, selectedLDRef) => {
  const chromosome = parseVariant2(leadVariant, region).chr

  DIMENSIONS.plotWidth = DIMENSIONS.width
    - DIMENSIONS.margins.left
    - DIMENSIONS.leftAxisWidth
    - DIMENSIONS.margins.right

  if(showRecombLine) DIMENSIONS.plotWidth -= DIMENSIONS.rightAxisWidth

  d3.select(plotContainer.value).selectAll('*').remove()

  rootSVG.value = LZ2Containers.createSVG(plotContainer.value, DIMENSIONS, plotBackgroundColor.value)
  LZ2Renderers.renderBorder(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_BORDER_COLOR)
  LZ2Renderers.renderHeader(rootSVG.value, DIMENSIONS, LZ2_DISPLAY_OPTIONS.PLOT_HEADER_COLOR, props.signal.lead_variant.vid, title.value, titleColor.value, onActionMenuClick)
  const thePlot = LZ2Containers.createPlotContainer(rootSVG.value, DIMENSIONS)

  const xAccessor = d => d.x
  const yAccessor = d => d.y

  const xStart = MZPage.xStart
  const xEnd = MZPage.xEnd
  const xScale = LZ2Scales.createXscale(xStart, xEnd, DIMENSIONS)

  const yScaleSignal = LZ2Scales.createYscaleSignal(yAccessor, signalData, DIMENSIONS)
  const yScaleRecomb = LZ2Scales.createYscaleRecomb(DIMENSIONS)

  LZ2Axes.renderXaxis(thePlot, xScale, DIMENSIONS, chromosome)
  LZ2Axes.renderYaxisSignal(thePlot, yScaleSignal, DIMENSIONS)
  if(showRecombLine) LZ2Axes.renderYaxisRecomb(thePlot, yScaleRecomb, DIMENSIONS)

  const clipID = `plot-area-clip-${props.ID}`
  LZ2Renderers.renderPlotClipPath(rootSVG, clipID, DIMENSIONS, LZ2_DISPLAY_OPTIONS.LEAD_MARKER_MARGIN)
  const plotGroup = thePlot.append('g').attr('clip-path', `url(#${clipID})`)

  LZ2Renderers.renderSignalData(plotGroup, signalData, xScale, yScaleSignal, xAccessor, yAccessor, tooltipCallbacks, theme, selectedLDRef)

  if(showRecombLine) LZ2Renderers.renderRecombLine(plotGroup, recombData, xScale, yScaleRecomb)
  if(showGenSigLine) LZ2Renderers.renderGenSigLine(plotGroup, xScale, yScaleSignal)
  if(showPlotID) LZ2Renderers.renderPlotIDBadge(rootSVG.value, plotID, DIMENSIONS)
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.plot-container {
  margin-right: 1rem;
  margin-top: 0;
}

:deep(.recomb-group.hidden) {
  display: none;
}
</style>
