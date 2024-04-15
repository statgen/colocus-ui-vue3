import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import router from '@/router'
import { PAGE_STORE_DATA_MAP, URLS } from '@/constants'
import { ppURL } from '@/util/util'

export const useFilterStore = defineStore('filterStore', {
  state: () => ({
    filterDataChanged: false,
    currentPageName: '',
    isFilterDataLoaded: false,
    isFilterButtonShowing: true,
    isFilterPanelShowing: true,
    isItemDataLoaded: false,
    countPairs: 0,
    dataItems: {},
    itemCount: 0,
    dirEffect: {},
    isDirEffectReady: false,
    filterLists: {
      analysisTypes: [],
      genes: [],
      phenotypes: [],
      studies: [],
      tissues: [],
    },
    searchPageData: getDefaultPageData(),
    locusZoomPageData: getDefaultPageData(),
  }),
  actions: {
    buildSearchURL (urlPath) {
      const parentKey = PAGE_STORE_DATA_MAP[this.currentPageName]
      const url = new URL(urlPath, window.location.origin)
      Object.entries(dataMapAPI).map(([key, value]) => {
        const p = this[parentKey].filters[key]
        if(p && p.toString().length > 0) url.searchParams.set(value, this[parentKey].filters[key])
      })

      const newOrdering = []
      this[parentKey].sortKeys.forEach((sortKey) => {
        const key = sortKey.key
        const order = sortKey.order
        const sortOrder = order === 'desc' ? '-' : ''
        if (key.includes('lead_variant')) {
          const signal = key.includes('signal1') ? 'signal1' : 'signal2'
          const ordering = `${sortOrder}${signal}_chrom,${sortOrder}${signal}_pos`
          newOrdering.push(ordering)
        } else {
          const sortField = sortKeyMapAPI[key] || key
          newOrdering.push(`${sortOrder}${sortField}`)
        }
      })

      if (newOrdering.length > 0) {
        url.searchParams.set('ordering', newOrdering.join(','))
      }
      return url.href
    },
    checkGenes(genes) {
      const testGenes = genes.split(',')
      const goodGenes = []
      const badGenes = []
      testGenes.forEach(gene => {
        if(this.filterLists.genes.includes(gene)) {
          goodGenes.push(gene)
        } else {
          badGenes.push(gene)
        }
      })
      return { goodGenes, badGenes }
    },
    copySearchFiltersToLZ() {
      for (const [key, value] of Object.entries(this.searchPageData.filters)) {
        this.locusZoomPageData.filters[key] = value
      }
      this.locusZoomPageData.filters.showEnsIDs = this.searchPageData.filters.showEnsIDs
      this.locusZoomPageData.filters.showEffects = this.searchPageData.filters.showEffects
      this.locusZoomPageData.filters.itemsPerPage = this.searchPageData.filters.itemsPerPage
      this.locusZoomPageData.filters.pageNum = 1
    },
    async loadFilterData() {
      if(this.isFilterDataLoaded) return
      const { data, fetchData } = useFetchData()
      if(await fetchData(URLS.FILTER_DATA)) {
        const d = data.value
        this.filterLists.analysisTypes = d.analysis_types.sort()
        this.filterLists.genes = d.genes.sort()
        this.filterLists.phenotypes = d.phenotypes.sort()
        this.filterLists.studies = d.studies.sort()
        this.filterLists.tissues = d.tissues.sort()
        this.isFilterDataLoaded = true
      }
    },
    async updateFilter(key, value) {
      console.log('fs: updating filter, loading data')
      const parentKey = PAGE_STORE_DATA_MAP[this.currentPageName]
      if(Object.hasOwn(this[parentKey].filters, key)) {
        this[parentKey].filters[key] = value
        if(key === 'pageSize') this[parentKey].filters.pageNum = 1
        if(key !== 'pageSize' && key !=='pageNum') this[parentKey].filters.pageNum = 1
        this.filterDataChanged = !this.filterDataChanged
      } else {
        throw new Error('bad key specified for update')
      }
    },
    async updateSort(newSort) {
      console.log('fs: sort updated, loading data')
      const parentKey = PAGE_STORE_DATA_MAP[this.currentPageName]
      this[parentKey].sortKeys = newSort
      this.filterDataChanged = !this.filterDataChanged
    },
    updateSwitch(key, value) {
      const parentKey = PAGE_STORE_DATA_MAP[this.currentPageName]
      this[parentKey][key] = value
    },
    toggleFilterPanel() {
      this.isFilterPanelShowing = !this.isFilterPanelShowing
    },
  },
  getters: {
  }
})

function getDefaultPageData() {
  return {
    showEnsIDs: false,
    showEffects: false,
    sortKeys: [],
    filters: {
      studies: [],
      genes: [],
      region: '',
      phenotypes: [],
      tissues: [],
      trait1log10p: "0",
      trait2log10p: "0",
      h4: "0.5",
      r2: "0.3",
      pageNum: "1",
      pageSize: "10",
    }
  }
}

// this maps between keys as defined in this store/app and those expected by the API
const dataMapAPI = {
  studies: 'studies',
  genes: 'genes',
  region: 'signal1_region',
  phenotypes: 'phenotypes',
  tissues: 'tissues',
  trait1log10p: 'signal1_min_logp',
  trait2log10p: 'signal2_min_logp',
  h4: 'min_h4',
  r2: 'min_r2',
  pageNum: 'page',
  pageSize: 'page_size',
}

// this maps data keys to the sort keys expected by the back end
const sortKeyMapAPI = {
  'coloc_h4': 'h4',
  'r2': 'r2',
  'n_coloc_between_traits': 'n_coloc_between_traits',
  'signal1.neg_log_p': 'signal1_logp',
  'signal2.neg_log_p': 'signal2_logp',
  'signal1.lead_variant.chrom': 'signal1_chrom',
  'signal1.lead_variant.pos': 'signal1_pos',
  'signal1.analysis.trait.uuid': 'signal1_trait',
  'signal2.analysis.trait.uuid': 'signal2_trait',
  'signal2.lead_variant.chrom': 'signal2_chrom',
  'signal2.lead_variant.pos': 'signal2_pos',
  'signal1.analysis.trait.gene.ens_id': 'signal1_gene_ens_id',
  'signal1.analysis.trait.gene.symbol': 'signal1_gene_symbol',
  'signal1.analysis.tissue': 'signal1_tissue',
  'signal1.analysis.trait.exon.ens_id': 'signal1_exon_ens_id',
  'signal2.analysis.trait.gene.ens_id': 'signal2_gene_ens_id',
  'signal2.analysis.trait.gene.symbol': 'signal2_gene_symbol',
  'signal2.analysis.tissue': 'signal2_tissue',
  'signal2.analysis.trait.exon.ens_id': 'signal2_exon_ens_id',
  'signal1.analysis.study.uuid': 'signal1_study',
  'signal2.analysis.study.uuid': 'signal2_study',
}

// allows hot module replacement of store in dev mode
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilterStore, import.meta.hot))
}
