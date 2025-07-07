import * as d3 from 'd3v7'

function createSVG(container, dimensions) {
  return d3.select(container)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
}

function createContainer(svg, dimensions) {
  return svg.append('g')
  .attr('transform', `translate(${dimensions.margins.left}, ${dimensions.margins.top})`)
}

function createXscale(xAccessor, xPaddingFactor, data, dimensions) {
  const [xMin, xMax] = d3.extent(data, xAccessor)
  const xRange = xMax - xMin

  return d3.scaleLinear()
    .domain([xMin - xRange * xPaddingFactor, xMax + xRange * xPaddingFactor])
    .range([0, dimensions.ctrWidth])
}

function createYscale(yAccessor, yPaddingFactor, data, dimensions) {
  const [yMin, yMax] = d3.extent(data, yAccessor)
  const yRange = yMax - yMin
  return d3.scaleLinear()
    .domain([yMin - yRange * yPaddingFactor, yMax + yRange * yPaddingFactor])
    .range([dimensions.ctrHeight, 0])
}

function createTooltip() {
  return d3.select('body')
    .append('div')
    .attr('class', 'D3RPTooltip')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('background', '#fff')
    .style('padding', '6px')
    .style('border', '1px solid #ccc')
    .style('pointer-events', 'none')
    .style('font-size', '1rem')
}

function renderXaxis(ctr, xScale, dimensions, chromosome) {
  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickSizeOuter(0)
    .tickFormat((d) => (d/1e6).toFixed(1))

  const xAxisGroup = ctr.append('g')
    .call(xAxis)
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .classed('axis', true)

  xAxisGroup.append('text')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margins.bottom - 4)
    .attr('fill', 'black')
    .text(`Chromosome: ${chromosome} (Mb)`)
}

function renderYaxis(ctr, yScale, dimensions) {
  const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSizeOuter(0)

  const yAxisGroup = ctr.append('g')
    .call(yAxis)
    .classed('axis', true)

  yAxisGroup.append('text')
    .attr('x', -dimensions.ctrHeight / 2)
    .attr('y', -dimensions.margins.left + 15)
    .attr('fill', 'black')
    .html('-log10 p-value')
    .style('transform', 'rotate(270deg)')
    .style('text-anchor', 'middle')
}

function renderData(ctr, data, xScale, yScale, xAccessor, yAccessor, tooltip) {
  ctr.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', d => d.size)
    .attr('fill', d => d.color)
    .on('mouseover', (event, d) => {
      tooltip
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY + 10}px`)
        .style('display', 'block')
        .html(`x: ${d.x.toFixed(1)}<br/>y: ${d.y.toFixed(1)}`)
    })
    .on('mouseout', () => {
      tooltip.style('display', 'none')
    })
}

export { createContainer, createSVG, createTooltip, createXscale, createYscale, renderXaxis, renderYaxis, renderData }
