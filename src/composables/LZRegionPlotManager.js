import { createVNode, ref, render } from 'vue'
import LzRegionPlot from '@/components/LZComponents/LZRegionPlot.vue'
import { loadRecombData, loadSignalData, parseVariant } from '@/util/LZRegionPlotUtil'
import { REF_BUILD, REF_BUILD_PORTAL } from '@/constants'

const plotCounter = ref(1)
const plotRegistry = new Map()

export function usePlotManager() {

  const mountPlot = async(args) => {
    const { plotContainer, variant, signal, type, chartClass, chartStyle, theme } = args
    const pv = parseVariant(variant)
    const id = `plot_${plotCounter.value}`
    const chromosome = pv.chr
    const title = `Plot ${plotCounter.value}: ${variant}`

    const signalData = await loadSignalData(variant, pv, signal, REF_BUILD, theme)
    const recombData = await loadRecombData(pv, REF_BUILD_PORTAL)

    const component = resolvePlotType(type)
    const mountEl = document.createElement('div')
    mountEl.className = 'plot-wrapper'
    plotContainer.value.appendChild(mountEl)

    const vnode = createVNode(component, {
      signalData,
      recombData,
      chartClass,
      chartStyle,
      id,
      title,
      chromosome,
    })

    render(vnode, mountEl)
    plotRegistry.set(id, { vnode, el: mountEl })
    plotCounter.value++
  }

  function unmountPlot(id) {
    const entry = plotRegistry.get(id)
    if (entry) {
      render(null, entry.el)
      entry.el.remove()
      plotRegistry.delete(id)
    }
  }

  function clearAllPlots() {
    for (const id of plotRegistry.keys()) {
      unmountPlot(id)
    }
  }

  function resolvePlotType(type) {
    switch (type) {
      case 'region':
        return LzRegionPlot
      // case 'compare': return D3ComparePlot
      default:
        console.error(`Unknown plot type: ${type}`)
    }
  }

  return {
    mountPlot,
    unmountPlot,
    clearAllPlots,
    get mountedPlotIds() {
      return [...plotRegistry.keys()]
    },
  }
}
