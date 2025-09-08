import { createVNode, ref, render } from 'vue'
import Lz2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'
import { D3_FONT_DEFAULTS, LZ2_DISPLAY_OPTIONS } from '@/constants'

const plotCounter = ref(1)
const reusablePlotIDs = []
const plotRegistry = new Map()

export function usePlotManager() {
  const exportPlotAsPNG = (plotID) => {
    const plotEntry = plotRegistry.get(plotID)
    if (!plotEntry) {
      console.error(`Plot ${plotID} not found!`)
      return
    }

    const svg = plotEntry.el.querySelector('svg')
    if (!svg) {
      console.error('No SVG element found!')
      return
    }

    const clonedSVG = svg.cloneNode(true)

    // Inject styles (fonts only)
    const style = document.createElement('style')
    style.textContent = D3_FONT_DEFAULTS
    clonedSVG.insertBefore(style, clonedSVG.firstChild)

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSVG)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svg.clientWidth || svg.getBoundingClientRect().width
      canvas.height = svg.clientHeight || svg.getBoundingClientRect().height

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = LZ2_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)

      canvas.toBlob(blob => {
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `LZ2-${plotID}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')

      URL.revokeObjectURL(url)
    }

    image.src = url
  }

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
    exportPlotAsPNG,
    mountPlot,
    unmountPlot,
    unmountAllPlots,
    get mountedPlotplotIDs() {
      return [...plotRegistry.keys()]
    },
  }
}
