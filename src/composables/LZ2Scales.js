import * as d3 from 'd3v7'

export function useLZ2Scales() {
  const createXscale = (xStart, xEnd, dimensions) => {
    return d3.scaleLinear()
      .domain([xStart, xEnd])
      .range([0, dimensions.plotWidth])
  }

  const createYscaleSignal = (yAccessor, data, dimensions) => {
    const [yMin, yMax] = d3.extent(data, yAccessor)
    const yRange = yMax - yMin
    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([dimensions.plotHeight, 0])
  }

  const createYscaleRecomb = (dimensions) => {
    return d3.scaleLinear()
      .domain([0, 100])
      .range([dimensions.plotHeight, 0])
  }


  return {
    createXscale,
    createYscaleSignal,
    createYscaleRecomb,
  }
}

