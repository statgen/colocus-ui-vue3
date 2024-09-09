// API endpoint uses generic prefix "t1" and "t2" to refer to the pair of results we get from this endpoint
const AXIS_OPTIONS = Object.freeze({ MARGINAL: 't1', CONDITIONAL: 't2' });

const BIOMARKER_TYPES = Object.freeze({
  PHENOTYPE: 'phenotype',
  GENE_EXPRESSION: 'gene-expression',
  EXON_EXPRESSION: 'exon-expression',
})

// Specify which lead variant to use for LD coloring
const LD_OPTIONS = Object.freeze({ SIGNAL1: 'signal1', SIGNAL2: 'signal2' });

const NEARBY_DIST = 500e3

const PAGE_NAMES = {
  GENES: 'genes',
  HELP: 'help',
  HOME: 'home',
  LOCUSZOOM: 'locuszoom',
  MANHATTAN: 'manhattan',
  SEARCH: 'search',
  STUDIES: 'studies',
  TRAITS: 'traits',
}

const URLS = {
  // these are for the data tables that exist on the associated pages
  [PAGE_NAMES.SEARCH]: '/api/v1/coloc/',
  [PAGE_NAMES.MANHATTAN]: '/api/v1/coloc/',
  [PAGE_NAMES.LOCUSZOOM]: '/api/v1/coloc/',
  // these are misc data links
  FILTER_DATA: '/api/v1/internal/search_metadata/',
  TRAIT_DATA: '/api/v1/internal/analysis/',
  PORTALDEV_API: 'https://portaldev.sph.umich.edu/api/v1/',
  SIGNALS_DATA: '/api/v1/signals/',
  LD_DATA: '/api/v1/ld/',
  PORTAL_GENE_CHECK: 'https://bioindex.hugeamp.org/api/bio/query/gene',
  PORTAL_GENE_PAGE: 'https://hugeamp.org/gene.html',
}

export { AXIS_OPTIONS, BIOMARKER_TYPES, LD_OPTIONS, NEARBY_DIST, PAGE_NAMES, URLS
}
