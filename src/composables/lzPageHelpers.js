import { createVNode, nextTick, ref, render, watch } from 'vue'
import { findPlotRegion, makePlotTitle, sortVariantArray } from '@/util/util'
import { useAppStore } from '@/stores/AppStore'
import { normalizeMarker } from "locuszoom/esm/helpers/parse"
import { get_compare_layout, get_region_layout, get_region_sources, toggle_trait } from "@/util/lz-layouts"
import { PAGE_NAMES, URLS } from "@/constants"
import LZPlot from '@/components/misc widgets/LZPLot.vue'
import * as d3 from 'd3'

const appStore = useAppStore()

export function useLZPageHelpers() {
// *** local variables *************************************************************************************************
  const refList = ref([])
  const addUniqueRefsOnly = ref(false)

  const compareVnodeRef = ref(null)
  const regionVnodeRef = ref(null)

// *** LD ref management ***********************************************************************************************
  watch(refList, (newList) => {
    appStore[PAGE_NAMES.LOCUSZOOM].uniqueLDrefs = getUniqueRefs(newList)
  }, { deep: true })

  const addRef = (ref) => {
    refList.value.push(ref)
  }

  const clearRefList = () => {
    refList.value.length = 0
  }

  const getUniqueRefs = (newList) => {
    const variantSet = [...new Set(newList.map(ref => ref.variantID))]
    let a = Array.from(variantSet)
    a = sortVariantArray(a)
    return a
  }

  const removePanelRef = (removeRef) => {
    const index = refList.value.findIndex(ref => removeRef.data === ref.panelID)
    if (index !== -1) {
      refList.value.splice(index, 1)
    }
  }

  const panelExists = (panel) => {
    return refList.value.some(ref => ref.panelID === panel)
  }

  const signalExists = (signal) => {
    return refList.value.some(ref => ref.signalID === signal)
  }

  const variantExists = (variant) => {
    return refList.value.some(ref => ref.variantID === variant)
  }

  // *** plot management ***********************************************************************************************
  const addPanelsForSignalPair = (signal1, signal2) => {
    const s1id = signal1.uuid
    const s2id = signal2.uuid
    const lzregion = regionVnodeRef.value.component.exposed

    if (!addUniqueRefsOnly.value || !signalExists(s1id)) {
      lzregion.addRegionPanel(signal1)
    }
    if (!addUniqueRefsOnly.value || !signalExists(s2id)) {
      lzregion.addRegionPanel(signal2)
    }
  }

  const applyLDref = (variant) => {
    const marker = normalizeMarker(variant)

    const lzcompare = compareVnodeRef.value.component.exposed
    lzcompare.callPlot((plot) => plot.applyState({ldrefvar: marker}))

    const lzregion = regionVnodeRef.value.component.exposed
    lzregion.callPlot((plot) => plot.applyState({ldrefvar: marker}))
  }

  const assembleLayout = (signal1, signal2, comparePlotRef, regionPlotRef) => {
    const plotProps = getPlotProps(signal1, signal2)
    buildCompareLayout(plotProps, comparePlotRef)
    buildRegionLayout(plotProps, regionPlotRef)

    const lzregion = regionVnodeRef.value.component.exposed
    lzregion.addRegionPanel(signal2)
    lzregion.addRegionPanel(signal1)
    lzregion.addGenePanel()
  }

  const buildCompareLayout = async (plotProps, comparePlotRef) => {
    const { initialState, s1Label, s1color, s2Label, s2color, source_configs } = plotProps
    const base_layout = get_compare_layout(s1Label, s2Label, initialState)
    const plotConfig = {
      base_layout,
      base_sources: source_configs,
      show_loading: true
    }

    compareVnodeRef.value = createVNode(LZPlot, plotConfig)

    try {
      render(null, comparePlotRef.value)
      render(compareVnodeRef.value, comparePlotRef.value)

      await nextTick(() => {
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

  const buildRegionLayout = (plotProps, regionPlotRef) => {
    const { signal1, signal2, initialState, s1Label, s2Label, source_configs } = plotProps

    const base_layout = get_region_layout(
      {id: signal1.uuid, label: s1Label},
      {id: signal2.uuid, label: s2Label},
      initialState
    )

    const plotConfig = {
      base_layout,
      base_sources: source_configs,
      show_loading: true
    }

    regionVnodeRef.value = createVNode(LZPlot, {
      ...plotConfig,
      onRegionPanelRemoved: regionPanelRemovedHandler,
      onRegionPanelAdded: (eventData) => addRef(eventData)
    })

    try {
      render(null, regionPlotRef.value)
      render(regionVnodeRef.value, regionPlotRef.value)
    } catch (e) {
      console.error('LZ Region plot render error:', e)
    }
  }

  const getPlotProps = (signal1, signal2) => {
    const variant = normalizeMarker(signal1.lead_variant.vid)
    const chr = signal1.lead_variant.chrom
    const {start, end} = findPlotRegion(signal1.lead_variant.pos, signal2.lead_variant.pos)
    const initialState = {
      chr,
      start,
      end,
      ldrefvar: variant,
    }
    const [s1Label, s1color] = makePlotTitle(signal1)
    const [s2Label, s2color] = makePlotTitle(signal2)
    const source_configs = get_region_sources(
      signal1.analysis.genome_build,
      `${URLS.SIGNALS_DATA}${signal1.uuid}/region/`,
      `${URLS.SIGNALS_DATA}${signal2.uuid}/region/`,
      `${URLS.LD_DATA}${signal1.analysis.ld}/region/`,
    )
    return {
      signal1, signal2,
      initialState,
      s1Label, s1color,
      s2Label, s2color,
      source_configs
    }
  }

  const regionPanelRemovedHandler = (eventData) => {
    if (eventData.data === 'genes') return // it was a gene panel, nothing to do
    removePanelRef(eventData)
    const variant = appStore[PAGE_NAMES.LOCUSZOOM].uniqueLDrefs[0]
    applyLDref(variant, regionVnodeRef)
    appStore[PAGE_NAMES.LOCUSZOOM].regionPanelRemoved = !appStore[PAGE_NAMES.LOCUSZOOM].regionPanelRemoved
  }

  const toggleConditionalMarginal = (newVal, oldVal) => {
    const lzcompare = compareVnodeRef.value.component.exposed
    const lzregion = regionVnodeRef.value.component.exposed

    try {
      lzregion.callPlot(async (plot) => {
        toggle_trait(plot.layout, 'assoc', oldVal, newVal)
        await plot.applyState()
      })

      lzcompare.callPlot(async (plot) => {
        toggle_trait(plot.layout, 'trait1', oldVal, newVal)
        toggle_trait(plot.layout, 'trait2', oldVal, newVal)
        await plot.applyState()
      })
    } catch (e) {
      console.error('Error toggling conditional/margin selector:', e)
    }
  }

  return {
    addPanelsForSignalPair,
    addUniqueRefsOnly,
    applyLDref,
    assembleLayout,
    clearRefList,
    toggleConditionalMarginal,
  }
}
