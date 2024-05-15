const BIOMARKER_TYPES = Object.freeze({
  PHENOTYPE: 'phenotype',
  GENE_EXPRESSION: 'gene-expression',
  EXON_EXPRESSION: 'exon-expression',
})

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

const PAGE_STORE_DATA_MAP = {
  search: 'searchPageData',
  locuszoom: 'locuszoomPageData',
  manhattan: 'manhattanPageData',
}

const URLS = {
  // these are for the data tables that exist on the associated pages
  [PAGE_NAMES.SEARCH]: '/api/v1/coloc/',
  [PAGE_NAMES.MANHATTAN]: '/api/v1/coloc/',
  [PAGE_NAMES.LOCUSZOOM]: '/api/v1/coloc/',
  // these are misc data links
  FILTER_DATA: '/api/v1/internal/search_metadata/',
  TRAIT_DATA: '/api/v1/internal/analysis/',
  LZ_DATA: '',
  PORTALDEV_API: 'https://portaldev.sph.umich.edu/api/v1/',
  SIGNALS_DATA: '/api/v1/signals/',
  LD_DATA: '/api/v1/ld/',
}

export { BIOMARKER_TYPES, NEARBY_DIST, PAGE_NAMES, PAGE_STORE_DATA_MAP, URLS
}
