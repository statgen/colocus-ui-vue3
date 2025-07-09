// API endpoint uses generic prefix "t1" and "t2" to refer to the pair of results we get from this endpoint
const CM_DATASET = Object.freeze({ MARGINAL: 't1', CONDITIONAL: 't2' });

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
  BAR_PRIMARY: "#c4e0f8",   // this is an HSL-lightened shade of CLC_HEADING
  BAR_SECONDARY: "#ffd1c7",
  BAR_TERTIARY: "#ddd",
}

const LZ_COLOR_THEMES = {
  locuszoom: ['rgba(70, 54, 153)', 'rgb(38, 188, 225)', 'rgb(110, 254, 104)', 'rgb(248, 195, 42)', 'rgb(219, 61, 17)', 'rgb(150, 50, 184)'],
  modern: ['rgba(70, 54, 153, 0.2)', 'rgb(38, 188, 225)', 'rgb(110, 254, 104)', 'rgb(248, 195, 42)', 'rgb(219, 61, 17)', 'rgb(150, 50, 184)'],
  greyscale: ['#aaaaaa', '#888888', '#666666', '#444444', '#222222', '#000000'],
  linecolor: '#a8a9ad', // silvery for recomb and significance lines
}

const NEARBY_DIST = 500e3

const PAGE_NAMES = {
  GENE: 'gene',
  HELP: 'help',
  HOME: 'home',
  LOCUSZOOM: 'locuszoom',
  LZ2TEST: 'lz2test',
  MANHATTAN: 'manhattan',
  SEARCH: 'search',
  STATS_QC: 'qcstats',
  STATS_SUMMARY: 'summarystats',
  STUDIES: 'studies',
  TRAITS: 'traits',
}

const SIDEBAR_WIDTH = 250
const STATS_PAGE_TOP = 'topOfThePage'

const URLS = {
  // our data
  COLOC_DATA: '/api/v1/coloc',
  FILTER_DATA: '/api/v1/internal/search_metadata',
  LD_DATA: '/api/v1/ld',
  QC_COLOC: '/api/v1/internal/coloc-slim',
  QC_SIGNALS: '/api/v1/internal/signals-slim',
  SIGNALS_DATA: '/api/v1/signals',
  STUDY_DATA: '/api/v1/datasets',
  RELEASE_DATA: '/api/v1/submissions',
  TRAIT_DATA: '/api/v1/internal/analysis',

  // CMD Portal data
  PORTAL_GENE_CHECK: 'https://bioindex.hugeamp.org/api/bio/query/gene',
  PORTAL_GENE_PAGE: 'https://hugeamp.org/gene.html',
  PORTAL_PHEN_CHECK: 'https://bioindex.hugeamp.org/api/bio/count/global-associations',
  PORTAL_PHEN_PAGE: 'https://hugeamp.org/phenotype.html',
  PORTAL_VAR_CHECK: 'https://bioindex.hugeamp.org/api/bio/query/variant',
  PORTAL_VAR_PAGE: 'https://hugeamp.org/variant.html',

  PORTALDEV_API: 'https://portaldev.sph.umich.edu/api/v1/',
}

const THRESHOLDS = {
  H4: 0.5,
  R2: 0.3,
}

export { CM_DATASET, BIOMARKER_TYPES, COLORS, NEARBY_DIST, SIDEBAR_WIDTH, STATS_PAGE_TOP, LZ_COLOR_THEMES, PAGE_NAMES, THRESHOLDS, URLS
}
