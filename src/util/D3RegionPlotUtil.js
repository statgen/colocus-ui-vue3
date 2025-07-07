import * as d3 from 'd3v7'
import { toRaw } from 'vue'
import { useFetchData } from '@/composables/fetchData'
import { LZ_COLOR_THEMES, URLS } from '@/constants'
import * as aq from 'arquero'


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

function getLDColor(r2, theme = 'locuszoom') {
  const colors = LZ_COLOR_THEMES[theme] || LZ_COLOR_THEMES.locuszoom
  if (r2 == null) return '#eeeeee' // fallback for null
  if (r2 > 0.999999) return colors[5]
  if (r2 > 0.8)       return colors[4]
  if (r2 > 0.6)       return colors[3]
  if (r2 > 0.4)       return colors[2]
  if (r2 > 0.2)       return colors[1]
  return colors[0]
}


const loadLZPlotData = async (v, signal) => {
  const { data, errorMessage, fetchData } = useFetchData()

  let base = `${URLS.LD_DATA}/UKBB_GRCh37_ALL/region/`
  let url = `${base}?chrom=${v.chr}&start=${v.start}&end=${v.end}&variant=${v.chr}:${v.loc}_${v.ref}/${v.alt}`
  let ldData = []
  if(await fetchData(url, 'lz2 ld data', 'lz2test')) {
    ldData = toRaw(data.value)
  }

  base = `/api/v1/signals/${signal}/region`
  url = `${base}?chrom=${v.chr}&start=${v.start}&end=${v.end}`
  let signalData
  if(await fetchData(url, 'lz2 signal data', 'lz2test')) {
    signalData = toRaw(data.value)
  }

  const t1 = aq.from(signalData)
  const t2 = aq.from(ldData).rename({ variant2: 'variant' }).rename({ correlation: 'r2' })
  const t3 = t1.join_left(t2, 'variant')
  const t4 = t3.derive ({
    variant: d => aq.op.replace(d.variant, /[:/]/g, '_'),
    variant1: d => aq.op.replace(d.variant1, /[:/]/g, '_'),
  })
  const t5 = t4.objects()

  const t6 = t5.map(row => ({
    x: row.position,
    y: row.t1_neg_log_pvalue,
    color: getLDColor(row.r2, 'modern'),
    size: 4,
  }))

  return t6
}


const parseVariant = (variant) => {
  const pieces = variant.split('_')
  let v = {
    chr: +pieces[0],
    loc: +pieces[1],
    ref: pieces[2],
    alt: pieces[3],
  }
  v.start = v.loc - 250e3 - 1000
  v.end = v.loc + 250e3 + 1000
  return v
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

export { createContainer, createSVG, createTooltip, createXscale, createYscale, loadLZPlotData, parseVariant,
  renderXaxis, renderYaxis, renderData
}
