import { createVNode, ref, render } from 'vue'
import Lz2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'

const plotCounter = ref(1)
const plotRegistry = new Map()

export function usePlotManager() {

  const mountPlot = async(args) => {
    const { plotsContainer, variant, signal, type, theme, onActionMenuClick } = args
    const plotID = `plot_${plotCounter.value}`

    const component = resolvePlotType(type)
    const mountEl = document.createElement('svg')
    plotsContainer.value.appendChild(mountEl)

    const vnode = createVNode(component, {
      ID: plotCounter.value,
      variant,
      signal,
      theme,
      onActionMenuClick,
    })

    render(vnode, mountEl)
    plotRegistry.set(plotID, { type, vnode, el: mountEl })
    plotCounter.value++
  }

  function unmountPlot(plotID) {
    const entry = plotRegistry.get(plotID)
    if (entry) {
      render(null, entry.el)
      entry.el.remove()
      plotRegistry.delete(plotID)
    }
  }

  function clearAllPlots() {
    for (const plotID of plotRegistry.keys()) {
      unmountPlot(plotID)
    }
  }

  function resolvePlotType(type) {
    switch (type) {
      case 'region':
        return Lz2RegionPlot
      // case 'compare': return D3ComparePlot
      default:
        console.error(`Unknown plot type: ${type}`)
    }
  }

  return {
    mountPlot,
    unmountPlot,
    clearAllPlots,
    get mountedPlotplotIDs() {
      return [...plotRegistry.keys()]
    },
  }
}
