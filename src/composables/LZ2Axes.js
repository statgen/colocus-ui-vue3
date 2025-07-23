import * as d3 from 'd3v7'
import { LZ_DISPLAY_OPTIONS } from '@/constants'

export function useLZ2Axes() {
  const renderXaxis = (ctr, xScale, dimensions, chromosome) => {
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSizeOuter(0)
      .tickFormat((d) => (d/1e6).toFixed(1))

    const xAxisGroup = ctr.append('g')
      .call(xAxis)
      .style('transform', `translateY(${dimensions.ctrHeight}px)`)
      .classed('lzrp-axis', true)

    xAxisGroup.append('text')
      .attr('x', dimensions.ctrWidth / 2)
      .attr('y', dimensions.margins.bottom - 8)
      .attr('fill', 'black')
      .text(`Chromosome: ${chromosome} (Mb)`)
  }

  const renderYaxisSignal = (ctr, yScale, dimensions) => {
    let ticks = yScale.ticks(5)
    if (!ticks.includes(0)) ticks = [0, ...ticks]

    const yAxis = d3.axisLeft(yScale)
      .tickValues(ticks)
      .tickFormat(d3.format("d")) // "d" = integer format, no decimals
      .tickSizeOuter(0)

    const yAxisGroup = ctr.append('g')
      .call(yAxis)
      .classed('lzrp-axis', true)

    yAxisGroup.append('text')
      .attr('x', -dimensions.ctrHeight / 2)
      .attr('y', -dimensions.margins.left + 17)
      .attr('fill', 'black')
      .html('-log10 p-value')
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle')
      .classed('lzrp-axis', true)
  }

  const renderYaxisRecomb = (ctr, yScale, dimensions) => {
    const yAxis = d3.axisRight(yScale)
      .ticks(5)
      .tickSizeOuter(0)

    const yAxisGroup = ctr.append('g')
      .attr('transform', `translate(${dimensions.ctrWidth}, 0)`) // move to right edge
      .call(yAxis)
      .classed('lzrp-axis', true)

    yAxisGroup.selectAll('text')
      .attr('fill', LZ_DISPLAY_OPTIONS.RECOMB_AXIS_COLOR)

    yAxisGroup.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -dimensions.ctrHeight / 2)
      .attr('y', dimensions.margins.right - 8)
      .attr('fill', LZ_DISPLAY_OPTIONS.RECOMB_AXIS_COLOR)
      .attr('text-anchor', 'middle')
      .text('Recomb (cM/Mb)')
      .classed('lzrp-axis', true)
  }

  return {
    renderXaxis,
    renderYaxisSignal,
    renderYaxisRecomb,
  }
}
