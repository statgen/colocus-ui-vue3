// API endpoint uses generic prefix "t1" and "t2" to refer to the pair of results we get from this endpoint
const AXIS_OPTIONS = Object.freeze({ MARGINAL: 't1', CONDITIONAL: 't2' });

const BIOMARKER_TYPES = Object.freeze({
  PHENOTYPE: 'phenotype',
  GENE_EXPRESSION: 'gene-expression',
  EXON_EXPRESSION: 'exon-expression',
})

const COLORS = {
  CLC_BACKGROUND: '#fafafa',
  CLC_ACTION: '#18c11c',
  CLC_HEADING: '#1E88E5',
  CLC_AMPBLUE: '#0097d6',
  CLC_EFF_POS: '#e3fdff',
  CLC_EFF_NEG: '#ffd1c7',
  CLC_EFF_ZERO: '#dddddd',
  CLC_EFF_NA: '#ffffff',
  CLC_TABLE_HIGHLIGHT: '#f0f8ff',
  CLC_TOOLTIP_BACKGROUND: '#eee',
  CLC_TOOLTIP_BORDER: '#2962ff',
  BAR_PRIMARY: "#8ef18f",
  BAR_SECONDARY: "#ffd1c7",
  BAR_TERTIARY: "#eee",
}

const NEARBY_DIST = 500e3

const PAGE_NAMES = {
  GENE: 'gene',
  HELP: 'help',
  HOME: 'home',
  LOCUSZOOM: 'locuszoom',
  MANHATTAN: 'manhattan',
  SEARCH: 'search',
  STATS_QC: 'qcstats',
  STATS_SUMMARY: 'summarystats',
  STUDIES: 'studies',
  TRAITS: 'traits',
}

const STATS_PAGE_TOP = 'topOfThePage'

const URLS = {
  // these are for the data tables that exist on the associated pages
  [PAGE_NAMES.SEARCH]: '/api/v1/coloc/',
  [PAGE_NAMES.MANHATTAN]: '/api/v1/coloc/',
  [PAGE_NAMES.LOCUSZOOM]: '/api/v1/coloc/',
  [PAGE_NAMES.GENE]: '/api/v1/coloc/',
  // these are misc data links
  FILTER_DATA: '/api/v1/internal/search_metadata/',
  STUDY_DATA: '/data/studies.json',
  TRAIT_DATA: '/api/v1/internal/analysis/',
  PORTALDEV_API: 'https://portaldev.sph.umich.edu/api/v1/',
  SIGNALS_DATA: '/api/v1/signals/',
  LD_DATA: '/api/v1/ld/',
  PORTAL_GENE_CHECK: 'https://bioindex.hugeamp.org/api/bio/query/gene',
  PORTAL_GENE_PAGE: 'https://hugeamp.org/gene.html',
  PORTAL_PHEN_CHECK: 'https://bioindex.hugeamp.org/api/bio/count/global-associations',
  PORTAL_PHEN_PAGE: 'https://hugeamp.org/phenotype.html',
  PORTAL_VAR_CHECK: 'https://bioindex.hugeamp.org/api/bio/query/variant',
  PORTAL_VAR_PAGE: 'https://hugeamp.org/variant.html',
  QC_COLOC: '/api/v1/internal/coloc-slim/',
  QC_SIGNALS: '/api/v1/internal/signals-slim/',
}

const THRESHOLDS = {
  H4: 0.5,
  R2: 0.3,
}

export { AXIS_OPTIONS, BIOMARKER_TYPES, COLORS, NEARBY_DIST, STATS_PAGE_TOP, PAGE_NAMES, THRESHOLDS, URLS
}
