import ColorHash from 'color-hash'
import dayjs from 'dayjs'
import { NEARBY_DIST } from '@/constants'

// for colorizing variant labels
const VARIANT_COLOR_MAP = [0.475]
const colorHasher = new ColorHash({ lightness: VARIANT_COLOR_MAP })

const findPlotRegion = (pos1, pos2) => {
  if (pos1 == null) pos1 = pos2
  if (pos2 == null) pos2 = pos1

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

  if (truncateLength && formattedVariant.length > truncateLength) {
    formattedVariant = `${formattedVariant.slice(0, truncateLength - 3)}...`
  }
  return formattedVariant
})

function makeAnalysisTitle(analysis) {
  return `${analysis.study.uuid} • ${analysis.trait.uuid}`;
}

const parseSignalDataForTitle = (signal) => {
  let trait = ''
  let analysisType = ''

  if (signal.analysis?.trait.phenotype) {
    analysisType = 'GWAS'
    trait = signal.analysis?.trait.uuid
  } else if (signal.analysis?.trait?.protein) {
    analysisType = 'pQTL/protein'
    trait = signal.analysis?.trait.gene.symbol
  } else if (signal.analysis?.trait.exon) {
    analysisType = 'eQTL/exon'
    trait = signal.analysis?.trait.gene.symbol
  } else if (signal.analysis?.trait.gene) {
    analysisType = 'eQTL/gene'
    trait = signal.analysis?.trait.gene.symbol
  } else if (signal.analysis?.trait?.methyl_probe) {
    analysisType = 'mQTL/probe'
    trait = signal.analysis?.trait.methyl_probe.uuid
  } else if (signal.analysis?.trait?.metabolite) {
    analysisType = 'metabolite'
    trait = signal.analysis?.trait.metabolite.uuid
  } else return 'unknown type'

  return {
    trait,
    analysisType,
    variant: signal.lead_variant.vid,
    study: signal.analysis.study.uuid,
    margOnly: signal?.is_marg,
    tissue: signal.analysis?.tissue,
    cellType: signal.analysis?.cell_type,
  }
}

function makePlotTitle(signal) {
  if (!signal) {
    return ['signal is null', 'red']
  }

  const SEP = '  '
  const pd = parseSignalDataForTitle(signal)
  if(pd === 'unknown type') return ['unknown type', 'red']

  const variantFormatted = middleTrim(formatVariantString(pd.variant), 7, 7)

  // const title = `${pd.trait}  ${pd.analysisType} ${pd.tissue} ${pd.cellType}  ${pd.variant}  ${pd.margOnly}`
  let title = ''
  title += `${pd.trait}${SEP}${pd.analysisType}`
  title += pd.analysisType === 'GWAS' ? SEP : `/${pd.tissue}${SEP}`
  title += pd.CellType ? `${pd.cellType}${SEP}` : ''
  title += `${variantFormatted}${SEP}`
  title += pd.margOnly ? `(marginal only)` : ''

  const color = colorHasher.hex(pd.variant)

  return [title, color]
}

// return true if s2 starts with s1 case-insensitive
const matchLowercase = ((s1, s2) => s2.toLowerCase().startsWith(s1.toLowerCase()))

// trim the middle between specified left and right of string
const middleTrim = (s, left=4, right=4) => {
  if(!s) return ''
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

const parseVariant = (variant) => {
  if(!variant) return
  const parts = variant.split('_')
  return {
    chromosome: parseInt(parts[0]),
    location: parseInt(parts[1]),
    rest: parts.slice(2).join('_')
  }
}

const parseVariant2 = (variant, region) => {
  const pieces = variant.split('_')
  let v = {
    chr: +pieces[0],
    loc: +pieces[1],
    ref: pieces[2],
    alt: pieces[3],
  }
  v.start = Math.max(1, v.loc - region)
  v.end = v.loc + region
  return v
}

const scrollBottom = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

const scrollToHeading = (id) => {
  const target = document.getElementById(id)
  if (target) {
    const toolbarHeight = document.querySelector('.v-toolbar').offsetHeight || 0
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - toolbarHeight
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })
  }
}

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

// call with await sleeper(n); this is only for analysis/debugging, not production use
const sleeper = async (sec = 5) => {
  await sleep(1000 * sec)
  console.log(`sleeper done after ${sec} seconds`)
}

const sortVariantArray = (variants) => {
  return variants.sort((a, b) => {
    const parsedA = parseVariant(a)
    const parsedB = parseVariant(b)
    if (parsedA.chromosome !== parsedB.chromosome) {
      return parsedA.chromosome - parsedB.chromosome
    }
    if (parsedA.location !== parsedB.location) {
      return parsedA.location - parsedB.location
    }
    return parsedA.rest.localeCompare(parsedB.rest)
  })
}

const timeLog = (...args) => {
  console.log(dayjs().format('HH:mm:ss.SSS: '), ...args)
}

const titleCase = (str) => {
  if (!str || str?.length === 0) {
    return ''
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
}

const truncateString = (str, length) => {
  if(str.length <= length) return str
  return str.substring(0, length) + '...'
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

export { colorHasher, findPlotRegion, formatVariantString, makeAnalysisTitle, makePlotTitle, matchLowercase,
  middleTrim, parseVariant2, ppURL, scrollBottom, scrollToHeading, scrollTop, sleeper, sortVariantArray, timeLog, titleCase,
  truncateString, url
}
