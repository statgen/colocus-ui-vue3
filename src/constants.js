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

const LZ2_DISPLAY_OPTIONS = {
  DIAMOND_MARGIN: 12, // allow extra space for lead variant diamond
  DIMENSIONS: {
    height: 230,
    headerHeight: 30,
    plotHeight: 200,
    width: 600,
    margins: { top: 15, right: 65, bottom: 48, left: 60 },
  },
  GEN_SIGNIFICANCE: Math.log10(5e-8), // ≈ -7.301
  LZ2_COLOR_THEMES: {
    LocusZoom: ['#473699', '#26bce1', '#6dfe68', '#f8c32a', '#db3d11', '#9632b8', '#eeeeee'],
    Modern: ['rgba(70, 54, 153, 0.2)', '#26bce1', '#6dfe68', '#f8c32a', '#db3d11', '#9632b8', '#eeeeee'],
    Greyscale: ['rgba(170, 170, 170, 0.2)', '#888888', '#666666', '#444444', '#222222', '#000000', '#eeeeee'],
  },
  PLOT_AXIS_FONT_SIZE: '1rem',
  PLOT_AXIS_FONT_WEIGHT: 400,
  PLOT_BACKGROUND_COLOR: '#ffffff', // '#fbfbfb'
  PLOT_BODY_FONT_SIZE: '1rem',
  PLOT_BODY_FONT_WEIGHT: 400,
  PLOT_BORDER_COLOR: '#777777',
  PLOT_HEADER_COLOR: '#fbfbfb', // 'hsl(208, 60%, 97%)', //'#F0F8FF', //'aliceblue',
  PLOT_HEADER_FONT_SIZE: '1.1rem',
  PLOT_HEADER_FONT_WEIGHT: 700,
  PLOT_FONT_FAMILY: 'Helvetica, Arial, sans-serif',
  PLOT_FONT_SIZE: '1rem',
  RECOMB_LINE_COLOR: '#6ccbac', // '#369979',
  RECOMB_AXIS_COLOR: '#6ccbac',
  SIG_LINE_COLOR: '#a8a9ad',
}

const D3_FONT_DEFAULTS = `
  .D3FontDefaults {
    font-family: ${LZ2_DISPLAY_OPTIONS.PLOT_FONT_FAMILY};
    font-size: ${LZ2_DISPLAY_OPTIONS.PLOT_FONT_SIZE};
    font-weight: ${LZ2_DISPLAY_OPTIONS.PLOT_BODY_FONT_WEIGHT};
  }
  .lzrp-axis text {
    font-family: ${LZ2_DISPLAY_OPTIONS.PLOT_FONT_FAMILY};
    font-size: ${LZ2_DISPLAY_OPTIONS.PLOT_AXIS_FONT_SIZE};
    font-weight: ${LZ2_DISPLAY_OPTIONS.PLOT_AXIS_FONT_WEIGHT};
  }
  .lzrp-header {
    font-family: ${LZ2_DISPLAY_OPTIONS.PLOT_FONT_FAMILY} !important;
    font-size: ${LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_SIZE} !important;
    font-weight: ${LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_WEIGHT} !important;
  }
`

LZ2_DISPLAY_OPTIONS.DIMENSIONS.ctrWidth = LZ2_DISPLAY_OPTIONS.DIMENSIONS.width
  - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.left
  - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.right
LZ2_DISPLAY_OPTIONS.DIMENSIONS.ctrHeight = LZ2_DISPLAY_OPTIONS.DIMENSIONS.height
  - LZ2_DISPLAY_OPTIONS.DIMENSIONS.headerHeight
  - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.top
  - LZ2_DISPLAY_OPTIONS.DIMENSIONS.margins.bottom

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

const REF_BUILD = 'UKBB_GRCh37_ALL'
const REF_BUILD_PORTAL = 'GRCh37'

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
  PORTALDEV_RECOMB: 'https://portaldev.sph.umich.edu/api/v1/annotation/recomb/results/',
}

const THRESHOLDS = {
  H4: 0.5,
  R2: 0.3,
}

export { CM_DATASET, BIOMARKER_TYPES, COLORS, D3_FONT_DEFAULTS, NEARBY_DIST, SIDEBAR_WIDTH, STATS_PAGE_TOP, LZ2_DISPLAY_OPTIONS, PAGE_NAMES,
  REF_BUILD, REF_BUILD_PORTAL, THRESHOLDS, URLS
}
