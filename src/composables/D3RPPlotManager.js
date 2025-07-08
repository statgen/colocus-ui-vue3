import { createVNode, ref, render } from 'vue'
import D3RegionPlot from '@/components/D3components/D3RegionPlot.vue'
import { loadLZPlotData, parseVariant } from '@/util/D3RegionPlotUtil'

const plotCounter = ref(1)
const plotRegistry = new Map()

export function usePlotManager() {

  const mountPlot = async(plotContainer, variant, signal, type, chartClass, chartStyle) => {
    const pv = parseVariant(variant)
    const id = `plot_${plotCounter.value}`
    const chromosome = pv.chr
    const title = `Plot ${plotCounter.value}: ${variant}`

    const data = await loadLZPlotData(pv, signal)

    const component = resolvePlotType(type)
    const mountEl = document.createElement('div')
    mountEl.className = 'plot-wrapper'
    plotContainer.value.appendChild(mountEl)

    const vnode = createVNode(component, {
      data,
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
        return D3RegionPlot
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
