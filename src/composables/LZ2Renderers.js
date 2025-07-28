import * as d3 from 'd3v7'
import { symbol, symbolTriangle, symbolDiamond } from 'd3-shape'
import { colorHasher } from '@/util/util'
import { LZ_DISPLAY_OPTIONS } from '@/constants'

export function useLZ2Renders() {
  const renderBorder = (svg, dimensions, color) => {
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2'); // dotted line effect
  }

  function renderHeader(svg, dimensions, color, variant, title, onActionMenuClick) {
    const headerGroup = svg.append('g')
      .attr('transform', 'translate(0, 0)')
      .classed('lzrp-header', true)

    // Background
    headerGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.headerHeight)
      .attr('fill', color)

    // Title
    headerGroup.append('text')
      .attr('x', 8)
      .attr('y', 20)
      .attr('font-size', '1rem')
      .attr('font-weight', 'bold')
      .attr('fill', colorHasher.hex(variant))
      .text(title)

    headerGroup.append('text')
      .attr('x', dimensions.width - 24)
      .attr('y', 20)
      .attr('font-size', '1.25rem')
      .attr('font-weight', 'bold')
      .text('\u2630') // Unicode for ☰
      .style('cursor', 'pointer')
      .on('click', onActionMenuClick)
  }

  const renderSignalData = (ctr, data, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks) => {
    const points = ctr.selectAll('.data-point')
      .data(data)
      .enter()
      .append(d => {
        return d.shape === 'circle'
          ? document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          : document.createElementNS('http://www.w3.org/2000/svg', 'path')
      })
      .attr('class', 'data-point')
      .attr('fill', d => d.color)

    // Position and shape
    points.each(function (d) {
      const el = d3.select(this)
      const x = xScale(xAccessor(d))
      const y = yScale(yAccessor(d))
      const size = d.size * d.size * 2.5  // d3.symbol uses area, not radius; size is relative to the size of a circle (4 by default)

      if (d.shape === 'circle') {
        el
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', d.size)
      } else if (d.shape === 'up-triangle') {
        el
          .attr('d', symbol().type(symbolTriangle).size(size)())
          .attr('transform', `translate(${x}, ${y}) rotate(0)`)
      } else if (d.shape === 'down-triangle') {
        el
          .attr('d', symbol().type(symbolTriangle).size(size)())
          .attr('transform', `translate(${x}, ${y}) rotate(180)`)
      } else if (d.shape === 'diamond') {
        el
          .attr('d', symbol().type(symbolDiamond).size(size * 3.5)())
          .attr('transform', `translate(${x}, ${y}) rotate(0)`)
          .classed('lead-variant', true)
          .attr('fill', d.color)
        // .attr('stroke', 'white')         // outline
        // .attr('stroke-width', 2)
      }

      ctr.selectAll('.lead-variant').raise()
    })

    points
      .on('mouseover', (event, d) => {
        tooltipCallbacks.show({
          variant: d.variant,
          position: d.x,
          refAllele: d.refAllele,
          pValue: d.y?.toFixed(1) || 'NA',
          r2: d.r2?.toFixed(3) || 'NA'
        }, event)
      })
      .on('mousemove', (event) => {
        tooltipCallbacks.updatePosition(event)
      })
      .on('mouseout', () => {
        tooltipCallbacks.hide()
      })
  }

  const renderGenSigLine = (ctr, xScale, yScale) => {
    const yThreshold = yScale(-LZ_DISPLAY_OPTIONS.GEN_SIGNIFICANCE)

    ctr.append('line')
      .attr('x1', xScale.range()[0])
      .attr('x2', xScale.range()[1])
      .attr('y1', yThreshold)
      .attr('y2', yThreshold)
      .attr('stroke', LZ_DISPLAY_OPTIONS.SIG_LINE_COLOR)
      .attr('stroke-dasharray', '4 6')
      .attr('stroke-width', 1)
  }

  const renderRecombLine = (plotGroup, data, xScale, yScale) => {
    const xAccessor = d => d.position
    const yAccessor = d => d.recomb_rate

    const lineGenerator = d3.line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)))
      .curve(d3.curveLinear)

    plotGroup.append('path')
      .datum(data)
      .attr('class', 'recomb-line')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', LZ_DISPLAY_OPTIONS.RECOMB_LINE_COLOR)
      .attr('stroke-width', 1)
  }

  // clipPath prevents shapes from overplotting axes
  const renderPlotClipPath = (svg, clipID, dimensions, diamondMargin) => {
    svg.value.append("defs")
      .append("clipPath")
      .attr("id", clipID)
      .append("rect")
      .attr("x", 0)
      .attr("y", -diamondMargin)
      .attr("width", dimensions.ctrWidth)
      .attr("height", dimensions.ctrHeight + diamondMargin)
  }

  return {
    renderBorder,
    renderHeader,
    renderSignalData,
    renderRecombLine,
    renderGenSigLine,
    renderPlotClipPath,
  }
}
