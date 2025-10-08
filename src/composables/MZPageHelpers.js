import { createVNode, nextTick, ref, render } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { parseVariant2 } from '@/util/util'
import Lz2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'

const plotCounter = ref(1)
const reusablePlotIDs = []

export function useMZPageHelpers() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  // *** external functions ****************************************************
  const clearPlotRegistry = () => {
    storeMZpage.plotRegistry = {}
    storeMZpage.rowSlotToPlotID = {}
    plotCounter.value = 1
    reusablePlotIDs.length = 0
  }

  const exportPlotContainer = async (elID, fileName) => {
    const el = document.getElementById(elID)
    if (!el) return
    if(Object.keys(storeMZpage.plotRegistry).length < 1) return

    setTimeout(async () => {
      try {
        storeMZpage.isExporting = true
        const canvas = await html2canvas(el, {
          useCORS: true,
          scale: LZ2_DISPLAY_OPTIONS.EXPORT_SCALE,
          backgroundColor: LZ2_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR
        })
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
          a.remove()
        } finally {
          // delay revocation so some browsers don’t cancel the download
          setTimeout(() => URL.revokeObjectURL(url), 0)
        }
      } finally {
        storeMZpage.isExporting = false
      }
    }, 0)
  }

  const getPlotIDfromRowSlot = (colocID, slot) => {
    return storeMZpage.rowSlotToPlotID?.[colocID]?.[slot] ?? null
  }

  const getSignals = () => {
    return Object.values(storeMZpage.plotRegistry).map(v => v.signalID)
  }

  const mountPlot = async(args) => {
    const { colocID, plotsContainer, showGenSigLine, showPlotID, showRecombLine, signal, signalID, slot, type, variant, onActionMenuClick, } = args
    const plotID = getNextPlotID()
    const component = resolvePlotType(type)
    const mountEl = document.createElement('div')
    plotsContainer.value.appendChild(mountEl)

    const vnode = createVNode(component, {
      ID: plotID,
      showGenSigLine,
      showRecombLine,
      signal,
      onActionMenuClick,
    })

    render(vnode, mountEl)
    storeMZpage.plotRegistry[plotID] = { colocID, mountEl, showGenSigLine, showPlotID, showRecombLine, signalID, slot, variant, vnode }
    // console.log('smzppr', storeMZpage.plotRegistry)
    makeColocsSignals()
    setRowSlotPlotID(colocID, slot, plotID)
    return plotID
  }

  const setPlotRegion = (variant, region) => {
    const pv = parseVariant2(variant, region)
    storeMZpage.xStart = pv.start
    storeMZpage.xEnd = pv.end
  }

  const unmountPlot = (plotID) => {
    const plot = storeMZpage.plotRegistry[plotID]
    if (plot) {
      const slot = storeMZpage.plotRegistry[plotID].slot
      const colocID = storeMZpage.plotRegistry[plotID].colocID
      render(null, plot.mountEl)
      plot.mountEl.remove()
      delete storeMZpage.plotRegistry[plotID]
      delete storeMZpage.rowSlotToPlotID[colocID][slot]
      reusablePlotIDs.push(plotID)
      setRowSlotPlotID(colocID, slot, null)
    }
  }

  const unmountAllPlots = async () => {
    for (const plotID of Object.keys(storeMZpage.plotRegistry)) {
      unmountPlot(plotID)
      await nextTick()
    }
    clearPlotRegistry()
  }

  // *** internal functions ****************************************************
  const getNextPlotID = () => {
    if(reusablePlotIDs.length > 0){
      const pid = Math.min(...reusablePlotIDs)
      reusablePlotIDs.splice(reusablePlotIDs.indexOf(pid), 1)
      return pid
    } else {
      return plotCounter.value++
    }
  }

  const makeColocsSignals = () => {
    storeMZpage.colocsSignals = Object.values(storeMZpage.plotRegistry).map(v => `${v.colocID}-${v.signalID}`)
  }

  const resolvePlotType = (type) => {
    switch (type) {
      case 'region':
        return Lz2RegionPlot
      // case 'compare': return D3ComparePlot
      default:
        console.error(`Unknown plot type: ${type}`)
    }
  }

  const setRowSlotPlotID = (colocID, slot, plotID) => {
    if (!storeMZpage.rowSlotToPlotID[colocID]) storeMZpage.rowSlotToPlotID[colocID] = {}
    storeMZpage.rowSlotToPlotID[colocID][slot] = plotID
  }


  return {
    clearPlotRegistry,
    exportPlotContainer,
    getPlotIDfromRowSlot,
    getSignals,
    mountPlot,
    setPlotRegion,
    unmountPlot,
    unmountAllPlots,
  }
}
