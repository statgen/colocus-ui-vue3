import { createVNode, ref, render } from 'vue'
import Lz2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'

const plotCounter = ref(1)
const reusablePlotIDs = []
const plotRegistry = new Map()

export function usePlotManager() {

  const getNextPlotID = () => {
    if(reusablePlotIDs.length > 0){
      const pid = Math.min(...reusablePlotIDs)
      reusablePlotIDs.splice(reusablePlotIDs.indexOf(pid), 1)
      return pid
    } else {
      return plotCounter.value++
    }
  }

  const mountPlot = async(args) => {
    const { plotsContainer, showGenSigLine, showRecombLine, signal, type, onActionMenuClick } = args
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
    plotRegistry.set(plotID, { type, vnode, el: mountEl })
    return plotID
  }

  const unmountPlot = (plotID) => {
    const entry = plotRegistry.get(plotID)
    if (entry) {
      render(null, entry.el)
      entry.el.remove()
      plotRegistry.delete(plotID)
      reusablePlotIDs.push(plotID)
    } else {
      console.warn(`error unmounting plot: ${plotID}`)
    }
  }

  function unmountAllPlots() {
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
    unmountAllPlots,
    get mountedPlotplotIDs() {
      return [...plotRegistry.keys()]
    },
  }
}
