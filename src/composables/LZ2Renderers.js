import * as d3 from 'd3v7'
import { symbol, symbolTriangle, symbolDiamond } from 'd3-shape'
import { LZ2_DISPLAY_OPTIONS } from '@/constants'

export function useLZ2Renderers() {
  const getColorFromR2 = (r2, colorSet) => {
    if (r2 == null) return colorSet[5]
    if (r2 > 0.8) return colorSet[4]
    if (r2 > 0.6) return colorSet[3]
    if (r2 > 0.4) return colorSet[2]
    if (r2 > 0.2) return colorSet[1]
    return colorSet[0]
  }

  const renderBorder = (svg, dimensions, color) => {
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3'); // dotted line effect
  }

  const renderHeader = (svg, dimensions, color, variant, title, titleColor, plotID) => {
    const headerGroup = svg.append('g')
      .attr('transform', 'translate(0, 0)')
      .attr('fill', LZ2_DISPLAY_OPTIONS.PLOT_HEADER_COLOR)
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
      .attr('x', 4)
      .attr('y', 20)
      .attr('fill', titleColor)
      .classed('lzrp-header', true)
      .style('white-space', 'pre')
      .text(title)

    // hamburger icon
    headerGroup.append('text')
      .attr('x', dimensions.width - 24)
      .attr('y', 20)
      .attr('font-size', '1.25rem')
      .attr('font-weight', LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_WEIGHT)
      .attr('fill', 'black')
      .text('\u2630') // Unicode for ☰
      .attr('data-action', 'hamburger-menu')
      .attr('data-plot-id', plotID)
      .style('cursor', 'pointer')
  }

  const renderPlotIDBadge = (svg, plotID, dimensions, opts = {}) => {
    const {
      offsetX = dimensions.badgeX,
      offsetY = dimensions.badgeY,
      padding = 4,
      rx = 0,
      fontFamily = LZ2_DISPLAY_OPTIONS.PLOT_FONT_FAMILY,
      fontSize = '0.75rem',
      fontWeight = '600',
      textFill = 'black',
      rectFill = '#ffffff',
      rectStroke = LZ2_DISPLAY_OPTIONS.PLOT_BORDER_COLOR,
      rectStrokeWidth = 1
    } = opts

    // Remove an old badge if re-rendering
    svg.selectAll('.plot-id-badge').remove()

    // Anchor group at bottom, draw upward from it
    const g = svg.append('g')
      .attr('class', 'plot-id-badge')
      .attr('transform', `translate(${offsetX}, ${dimensions.height - offsetY})`)
      .attr('pointer-events', 'none')

    // render text first
    const text = g.append('text')
      .text(String(plotID))
      .attr('x', padding)
      // place text so that its baseline is inside the box we draw upward
      .attr('y', -padding)
      .attr('dominant-baseline', 'ideographic')
      .attr('font-family', fontFamily)
      .attr('font-size', fontSize)
      .attr('font-weight', fontWeight)
      .attr('fill', textFill)

    // Measure text and size rect accordingly
    const { width: tw, height: th } = text.node().getBBox()
    const w = tw + padding * 2
    const h = th + padding * 2

    // Draw rect behind text (from the anchor upward)
    g.insert('rect', 'text')
      .attr('x', 0)
      .attr('y', -h)
      .attr('width', w)
      .attr('height', h)
      .attr('rx', rx)
      .attr('ry', rx)
      .attr('fill', rectFill)
      .attr('stroke', rectStroke)
      .attr('stroke-width', rectStrokeWidth)
  }

  const renderSignalData = (ctr, data, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks, themeName, selectedLDRef) => {
    const theme = LZ2_DISPLAY_OPTIONS.LZ2_THEMES[themeName]
    const colorSet = theme.colors
    const sizeSet = theme.sizes
    const points = ctr.selectAll('.data-point')
      .data(data)
      .enter()
      .append(d => {
        return d.beta === 0
          ? document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          : document.createElementNS('http://www.w3.org/2000/svg', 'path')
      })
      .attr('class', 'data-point')
      .attr('fill', d => getColorFromR2(d.r2, colorSet))

    // Position and shape
    points.each(function (d) {
      const el = d3.select(this)
      const x = xScale(xAccessor(d))
      const y = yScale(yAccessor(d))
      // console.log(`x: ${x}, y: ${y}`)
      if(!Number.isFinite(x) || !Number.isFinite(y)) {
        console.warn(`Bad plot data, skipping: x=${x}, y=${y}`)
        return
      }

      if(d.beta === 0) {
        el
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', sizeSet.circle)
      } else if(d.variant === selectedLDRef) {
        if(theme.leadShape === 'triangle') {
          el.attr('d', symbol().type(symbolTriangle).size(sizeSet.lead)())
        } else {
          el.attr('d', symbol().type(symbolDiamond).size(sizeSet.lead)())
        }
        el
          .classed('lead-variant', true)
          .attr('fill', themeName === 'LocusZoom' ? theme.leadColor : getColorFromR2(d.r2, colorSet))
          .attr('stroke', theme.leadBorderColor) // outline
          .attr('stroke-width', 1)
      } else {
        el.attr('d', symbol().type(symbolTriangle).size(sizeSet.triangle)())
      }

      d.beta < 0
        ? el.attr('transform', `translate(${x}, ${y}) rotate(180)`)
        : el.attr('transform', `translate(${x}, ${y}) rotate(0)`)
    })

    ctr.selectAll('.lead-variant').raise()

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
    const yThreshold = yScale(-LZ2_DISPLAY_OPTIONS.GEN_SIGNIFICANCE)

    ctr.append('line')
      .attr('x1', xScale.range()[0])
      .attr('x2', xScale.range()[1])
      .attr('y1', yThreshold)
      .attr('y2', yThreshold)
      .attr('stroke', LZ2_DISPLAY_OPTIONS.SIG_LINE_COLOR)
      .attr('stroke-dasharray', '4 6')
      .attr('stroke-width', 1)
      .classed('gensig-group', true)
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
      .attr('stroke', LZ2_DISPLAY_OPTIONS.RECOMB_LINE_COLOR)
      .attr('stroke-width', 1)
      .classed('recomb-group', true)
  }

  // clipPath prevents shapes from overplotting axes
  const renderPlotClipPath = (svg, clipID, dimensions, diamondMargin) => {
    svg.value.append("defs")
      .append("clipPath")
      .attr("id", clipID)
      .append("rect")
      .attr("x", 0)
      .attr("y", -diamondMargin)
      .attr("width", dimensions.plotWidth)
      .attr("height", dimensions.plotHeight + diamondMargin)
  }

  return {
    renderBorder,
    renderHeader,
    renderPlotIDBadge,
    renderSignalData,
    renderRecombLine,
    renderGenSigLine,
    renderPlotClipPath,
  }
}
