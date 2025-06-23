import { createVNode, render } from 'vue'
import D3RegionPlot from '@/components/D3components/D3RegionPlot.vue'

const plotRegistry = new Map()

export function usePlotManager() {
  function mountPlot({ id, plotContainer, type = 'region', data, dimensions, chartClass, chartStyle, title }) {
    if (plotRegistry.has(id)) {
      console.warn(`Plot with id "${id}" already exists`)
      return
    }

    const component = resolvePlotComponent(type)

    const mountEl = document.createElement('div')
    mountEl.className = 'plot-wrapper'
    plotContainer.appendChild(mountEl)

    const vnode = createVNode(component, {
      data,
      dimensions,
      chartClass,
      chartStyle,
      id,
      title,
    })

    render(vnode, mountEl)

    plotRegistry.set(id, { vnode, el: mountEl })
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

  function resolvePlotComponent(type) {
    switch (type) {
      case 'region':
        return D3RegionPlot
      // case 'compare': return D3ComparePlot
      default:
        throw new Error(`Unknown plot type: ${type}`)
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
