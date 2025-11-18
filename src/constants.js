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
  DEFAULT_Y_AXIS: 'conditional',
  EXPORT_SCALE: 3,
  LEAD_MARKER_MARGIN: 12, // allow extra space for lead variant marker
  DIMENSIONS: {
    badgeX: 8,
    badgeY: 8,
    height: 225,
    headerHeight: 30,
    margins: { top: 15, right: 15, bottom: 48, left: 20 },
    plotHeight: 0, // computed below
    leftAxisWidth: 45,
    rightAxisWidth: 55,
    plotWidth: 0, // computed in LZ2RegionPlot.renderPlot
    width: 450,
  },
  GEN_SIGNIFICANCE: Math.log10(5e-8), // ≈ -7.301
  LZ2_THEMES: {
    Greyscale: {
      colors: ['rgba(170, 170, 170, 0.2)', '#888888', '#666666', '#444444', '#222222', '#eeeeee'],
      leadBorderColor: 'black',
      leadShape: 'triangle',
      sizes: {
        circle: 4,
        triangle: 4 * 4 * 2.5,
        lead: 4 * 4 * 7,
      },
    },
    LocusZoom: {
      colors: ['#473699', '#26bce1', '#6dfe68', '#f8c32a', '#db3d11', '#eeeeee'],
      leadColor: '#9632b8',
      leadBorderColor: 'lightgreen',
      leadShape: 'diamond',
      sizes: {
        circle: 4,
        triangle: 4 * 4 * 2.5,    // d3.symbol uses area, not radius, for size
        lead: 4 * 4 * 2.5 * 3.5,  // d3.symbol uses area, not radius, for size
      },
    },
    Modern: {
      colors: ['rgba(70, 54, 153, 0.2)', '#26bce1', '#6dfe68', '#f8c32a', '#db3d11', '#eeeeee'],
      leadBorderColor: '#11AFDB',
      leadShape: 'triangle',
      sizes: {
        circle: 4,
        triangle: 4 * 4 * 2.5,
        lead: 4 * 4 * 7,
      },
    },
  },
  PLOT_AXIS_FONT_SIZE: '1rem',
  PLOT_AXIS_FONT_WEIGHT: 400,
  PLOT_BACKGROUND_COLOR: '#ffffff', // '#fbfbfb'
  PLOT_BODY_FONT_SIZE: '1rem',
  PLOT_BODY_FONT_WEIGHT: 400,
  PLOT_BORDER_COLOR: '#878787',
  PLOT_HEADER_COLOR: '#fbfbfb', // 'hsl(208, 60%, 97%)', //'#F0F8FF', //'aliceblue',
  PLOT_FONT_FAMILY: 'Helvetica, Arial, sans-serif',
  PLOT_FONT_SIZE: '1rem',
  PLOT_HEADER_FONT_FAMILY: 'Helvetica, Arial, sans-serif', // matching monospaced fonts: 'Menlo, Consolas, Monaco, monospace',
  PLOT_HEADER_FONT_SIZE: '1rem',
  PLOT_HEADER_FONT_WEIGHT: 400,
  PLOT_POINT_SIZES: {
    CIRCLE: 4,
    TRIANGLE: 4 * 4 * 2.5,  // d3.symbol uses area, not radius
    LEAD: 4 * 4 * 7,      // d3.symbol uses area, not radius
  },
  PLOTS_CONTAINER_ID: 'plotsContainer',
  RECOMB_LINE_COLOR: '#6ccbac', // '#369979',
  RECOMB_AXIS_COLOR: '#6ccbac',
  SIG_LINE_COLOR: '#a8a9ad',
}

const LDOD = LZ2_DISPLAY_OPTIONS.DIMENSIONS

const MZ_GRID_DISPLAY_OPTIONS = {
  actionMenuWidth: 300,
  defaultCols: 2,
  defaultRows: 4,
  gap: 8,
  headerRowHeight: 24,
  headerColWidth: 24,
  cellHeight: LDOD.height,
  cellWidth: LDOD.width,
}

LDOD.plotHeight = LDOD.height
  - LDOD.headerHeight
  - LDOD.margins.top
  - LDOD.margins.bottom

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
    font-family: ${LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_FAMILY} !important;
    font-size: ${LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_SIZE} !important;
    font-weight: ${LZ2_DISPLAY_OPTIONS.PLOT_HEADER_FONT_WEIGHT} !important;
  }
`
const MX_TOOLBOX_WIDTH = 300

const NEARBY_DIST = 500e3

const PAGE_NAMES = {
  GENE: 'gene',
  HELP: 'help',
  HOME: 'home',
  LOCUSZOOM: 'locuszoom',
  MANHATTAN: 'manhattan',
  MULTIZOOM: 'multizoom',
  SEARCH: 'search',
  STATS_QC: 'qcstats',
  STATS_SUMMARY: 'summarystats',
  STUDIES: 'studies',
  TRAITS: 'traits',
}

const PLOT_REGION_DEFAULT = 250e3

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

  PORTALDEV_API: 'https://services.locuszoom.org/api/v1/',
  PORTALDEV_RECOMB: 'https://services.locuszoom.org/api/v1/annotation/recomb/results/',
}

const THRESHOLDS = {
  H4: 0.5,
  R2: 0.3,
}

export {
  BIOMARKER_TYPES,
  CM_DATASET,
  COLORS,
  D3_FONT_DEFAULTS,
  MZ_GRID_DISPLAY_OPTIONS,
  LZ2_DISPLAY_OPTIONS,
  MX_TOOLBOX_WIDTH,
  NEARBY_DIST,
  PAGE_NAMES,
  PLOT_REGION_DEFAULT,
  REF_BUILD,
  REF_BUILD_PORTAL,
  SIDEBAR_WIDTH,
  STATS_PAGE_TOP,
  THRESHOLDS,
  URLS,
}
