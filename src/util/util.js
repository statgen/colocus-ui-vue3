import ColorHash from 'color-hash'
import { NEARBY_DIST } from '@/constants'

// for colorizing variant labels
const VARIANT_COLOR_MAP = [0.475]
const colorHasher = new ColorHash({ lightness: VARIANT_COLOR_MAP })

const findPlotRegion = (pos1, pos2) => {
  // console.log('p1, p2:',pos1, pos2)
  const min = Math.min(pos1, pos2)
  const max = Math.max(pos1, pos2)
  const between = max - min

  let start, end
  if ((max - min) > NEARBY_DIST) {
    // The 1000 is just to nudge it slightly away from axis boundaries
    start = Math.max(1, min - 1000)
    end = max + 1000
  } else {
    const remain = Math.ceil((NEARBY_DIST - between) / 2)
    start = Math.max(1, min - remain)
    end = max + remain
  }
  // console.log('start, end', start, end)

  return { start, end }
}

// for formatting the text of variant labels
const formatVariantString = ((variant, truncateLength = 0) => {
  if(!variant) return ''

  const components = variant.split('_')

  components[1] = parseInt(components[1]).toLocaleString()

  let formattedVariant = components.join('_')

  if (truncateLength) {
    if (formattedVariant.length > truncateLength) {
      formattedVariant = `${formattedVariant.slice(0, truncateLength - 3)}...`
    }
  }
  return formattedVariant
})

function makePlotTitle(signal) {
  let part1 = ''
  if (signal.analysis.trait.phenotype) {   // This trait is a GWAS phenotype
    part1 += signal.analysis.trait.uuid
  } else if (signal.analysis.trait.exon) { // This trait is an exon expression trait
    part1 += signal.analysis.trait.gene.symbol
  } else if (signal.analysis.trait.gene) { // This trait is a gene expression trait
    part1 += signal.analysis.trait.gene.symbol
  }
  const variant = formatVariantString(signal.lead_variant.vid)
  const study = signal.analysis.study.uuid
  const title = `${part1}    ${variant}    ${study}`
  const color = colorHasher.hex(signal.lead_variant.vid);
  return [title, color];
}

// return true if s2 starts with s1 case-insensitive
const matchLowercase = ((s1, s2) => s2.toLowerCase().startsWith(s1.toLowerCase()))

// trim the middle between specified left and right of string
const middleTrim = (s, left=4, right=4) => {
  left = Math.max(1, left)
  right = Math.max(1, right)
  if(s.length <= left + right) return s
  return `${s.slice(0, left)}...${s.slice(-right)}`
}

// pretty print url for debugging and reducing eye strain
const ppURL = (url) => {
  if(!url) return url
  let s = url.replace('?', '\n  ')
    .replace(/&/g, '\n  ')
    .replace(/%2C/g, ',')
  return s
}

/**
 * A tagged template function that encodes URL parameters used in path segments / query params
 *   Usage: url`https://website.example/${value1}/?param=${value2}`
 *   Query params can be handled completely via the standard `URL` interface in JS; this is useful mainly for initial encoding of path segments
 * @param strings
 * @param values
 */
function url(strings, ...values) {
  let res = '';
  strings.forEach((seg, i) => {
    res += seg + encodeURIComponent((values[i] || ''));
  });
  // console.log('url:', res)
  return res;
}

export { colorHasher, findPlotRegion, formatVariantString, makePlotTitle, matchLowercase, middleTrim, ppURL, url }
