import * as d3 from 'd3v7'
import { toRaw } from 'vue'
import { useFetchData } from '@/composables/fetchData'
import { LZ_COLOR_THEMES, URLS } from '@/constants'
import * as aq from 'arquero'
import { symbol, symbolTriangle, symbolDiamond } from 'd3-shape'

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

const getShape = (beta, v1, v2) => {
  if (v1 === v2) return 'diamond'
  else if (beta > 0) return 'up-triangle'
  else if (beta < 0) return 'down-triangle'
  else return 'circle'
}

const loadLZPlotData = async (variant, pv, signal) => {
  const { data, errorMessage, fetchData } = useFetchData()

  let base = `${URLS.LD_DATA}/UKBB_GRCh37_ALL/region/`
  let url = `${base}?chrom=${pv.chr}&start=${pv.start}&end=${pv.end}&variant=${pv.chr}:${pv.loc}_${pv.ref}/${pv.alt}`
  let ldData = []
  if(await fetchData(url, 'lz2 ld data', 'lz2test')) {
    ldData = toRaw(data.value)
  } else {
    console.error("Failed to fetch LD data")
    return
  }

  base = `${URLS.SIGNALS_DATA}/${signal}/region`
  url = `${base}?chrom=${pv.chr}&start=${pv.start}&end=${pv.end}`
  let signalData
  if(await fetchData(url, 'lz2 signal data', 'lz2test')) {
    signalData = toRaw(data.value)
  } else {
    console.error("Failed to fetch signal data")
    return
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
    r2: row.r2,
    variant: row.variant,
    refAllele: row.ref_allele,
    color: getLDColor(row.r2, 'modern'),
    shape: getShape(row.t1_beta, variant, row.variant),
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
    .tickFormat((d) => (d/1e6).toFixed(2))

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

function renderData(ctr, data, xScale, yScale, xAccessor, yAccessor, tooltipCallbacks) {

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
        .attr('d', symbol().type(symbolDiamond).size(size * 2)())
        .attr('transform', `translate(${x}, ${y}) rotate(0)`)
        .classed('lead-variant', true)
    }
  })

  // Tooltip events
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

export { createContainer, createSVG, createXscale, createYscale, loadLZPlotData, parseVariant,
  renderXaxis, renderYaxis, renderData
}
