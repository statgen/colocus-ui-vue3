const PAGE_STORE_DATA_MAP = {
  search: 'searchPageData',
  locuszoom: 'locuszoomPageData',
  manhattan: 'manhattanPageData',
}

const BIOMARKER_TYPES = Object.freeze({
  PHENOTYPE: 'phenotype',
  GENE_EXPRESSION: 'gene-expression',
  EXON_EXPRESSION: 'exon-expression',
})

const VARIANT_COLOR_MAP = [0.7, 0.8, 0.7]

const URLS = {
  SEARCH_DATA: '/api/v1/coloc/',
  FILTER_DATA: '/api/v1/internal/search_metadata/',
  TRAIT_DATA: '/api/v1/analysis/',
  LZ_DATA: '',
}

export { BIOMARKER_TYPES, PAGE_STORE_DATA_MAP, VARIANT_COLOR_MAP, URLS
}
