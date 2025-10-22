import { createVNode, nextTick, ref, render } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { parseVariant2 } from '@/util/util'
import { LZ2_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'

export function useMZPageHelpers() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  // *** external functions ****************************************************
  const clearPlotRegistry = () => {
    storeMZpage.plotRegistry = {}
    storeMZpage.rowSlotToPlotID = {}
    storeMZpage.plotCounter = 1
    storeMZpage.reusablePlotIDs.length = 0
  }

  const exportPlotContainer = async (elID, fileName) => {
    if(storeMZpage.plotRegistry.length < 1) return

    const el = document.getElementById(elID)

    setTimeout(async () => {
      try {
        el.classList.add('export-mode')
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
        el.classList.remove('export-mode')
        storeMZpage.isExporting = false
      }
    }, 0)
  }

  const getPlotIDfromRowSlot = (colocID, slot) => {
    return storeMZpage.rowSlotToPlotID?.[colocID]?.[slot] ?? null
  }

  const mountPlot = async(args) => {
    const { cell, colocID, plotsContainer, showGenSigLine, showPlotID, showRecombLine, signal, signalID, slot, type, variant, onActionMenuClick, } = args
    const plotID = getNextPlotID()
    const component = resolvePlotType(type)
    // const mountEl = document.createElement('div')
    // await nextTick()
    // const mountEl = document.querySelector(`cell_${cell}`)
    // plotsContainer.value.appendChild(mountEl)

    const vnode = createVNode(component, {
      ID: plotID,
      showGenSigLine,
      showRecombLine,
      signal,
      onActionMenuClick,
    })

    // render(vnode, mountEl)
    const mountEl = null
    storeMZpage.plotRegistry[plotID] = { colocID, mountEl, showGenSigLine, showPlotID, showRecombLine, signalID, slot, variant, vnode }
    // console.log('smzppr', storeMZpage.plotRegistry)
    storeMZpage.gridMap[cell] = plotID
    makeColocsSignals()
    setRowSlotPlotID(colocID, slot, plotID)
    return plotID
  }

  const setPlotRegion = (variant, region) => {
    const pv = parseVariant2(variant, region)
    storeMZpage.xStart = pv.start
    storeMZpage.xEnd = pv.end
  }

  const setRowSlotPlotID = (colocID, slot, plotID) => {
    if (!storeMZpage.rowSlotToPlotID[colocID]) storeMZpage.rowSlotToPlotID[colocID] = {}
    storeMZpage.rowSlotToPlotID[colocID][slot] = plotID
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

  return {
    clearPlotRegistry,
    exportPlotContainer,
    getPlotIDfromRowSlot,
    mountPlot,
    setPlotRegion,
    setRowSlotPlotID,
    unmountPlot,
    unmountAllPlots,
  }
}
