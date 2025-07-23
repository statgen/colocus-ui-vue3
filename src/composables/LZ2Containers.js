import * as d3 from 'd3v7'

export function useLZ2Containers() {
  const createSVG = (container, dimensions) => {
    return d3.select(container)
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
  }

  const createPlotContainer = (svg, dimensions) => {
    const verticalOffset = dimensions.headerHeight + dimensions.margins.top
    return svg.append('g')
      .attr('transform', `translate(${dimensions.margins.left}, ${verticalOffset})`)
  }

  return {
    createSVG,
    createPlotContainer,
  }
}
