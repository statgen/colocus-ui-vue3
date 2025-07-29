import * as d3 from 'd3v7'

export function useLZ2Containers() {
  const createSVG = (container, dimensions, backgroundColor) => {
    return d3.select(container)
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .classed('D3FontDefaults lzrp-body', true)
      .style('background-color', backgroundColor)
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
