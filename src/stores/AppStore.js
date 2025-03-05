import { markRaw } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import { PAGE_NAMES, THRESHOLDS, URLS } from '@/constants'
import { findPlotRegion } from '@/util/util'

export const useAppStore = defineStore('appStore', {
  state: () => ({
    // preloadTrait: '',
    currentPageName: '',
    dataTable: {
      countPairs: 0,  // total records in the data set
      itemCount: 0,   // records shown in the data table
      dirEffect: {},
      isDirEffectReady: false,
    },
    filterPanelControls: {
      filterDataChanged: false,
      isFilterButtonShowing: true,
      isFilterDataLoaded: false,
      isFilterPanelShowing: true,
      lastFilterUpdated: '',
      analysisTypes: markRaw([]),
      genes: markRaw([]),
      phenotypes: markRaw([]),
      studies: markRaw([]),
      tissues: markRaw([]),
    },
    [PAGE_NAMES.GENE]: {
      colorCodeVariants: true,
      showDatasets: false,
      showEnsIDs: false,
    },
    [PAGE_NAMES.LOCUSZOOM]: {
      colocData: markRaw({}),
      colocDataReady: false,
      colocID: '',
      filterDataChanged: false,
      lzLeadVarBlink: true,
      lzLeadDOMIDs: [],
      plotID: 0,
      regionPanelRemoved: false,
      tableDataLoaded: false,
      uniqueLDrefs: [],
      ...getFilterPanelSettings()
    },
    [PAGE_NAMES.MANHATTAN]: {
      analysisID: '',
      loadManhattanDataFlag: false,
      manhattanData: markRaw([]),
      manhattanDataReady: false,
      ...getFilterPanelSettings()
    },
    [PAGE_NAMES.SEARCH]: {
      pastedGenes: null,
      ...getFilterPanelSettings()
    },
  }),

  actions: {
    addQueryString(url) {
      const parentKey = this.currentPageName

      // add ordering clause first
      const newOrdering = []
      this[parentKey].filters.sortKeys.forEach((sortKey) => {
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

      // then add remaining filters
      Object.entries(dataMapAPI).map(([key, value]) => {
        const p = this[parentKey].filters[key]
        if(p?.toString().length > 0) url.searchParams.set(value, p)
      })
    },

    buildLZdataTableURL(urlPath, signal1, signal2) {
      const url = new URL(urlPath, window.location.origin)
      const { start, end } = findPlotRegion(
        signal1.lead_variant.pos,
        signal2.lead_variant.pos
      )

      const signal1_region = `${signal1.lead_variant.chrom}:${start}-${end}`
      const signal2_region = `${signal2.lead_variant.chrom}:${start}-${end}`

      url.searchParams.set('signal1_region', signal1_region)
      url.searchParams.set('signal2_region', signal2_region)

      this.addQueryString(url)

      return url
    },

    buildSearchURL (urlPath) {
      const url = new URL(urlPath, window.location.origin)
      this.addQueryString(url)
      return url
    },

    checkGenes(geneStr) {
      let testGenes = geneStr.replace(/ |\t|\r|\n/g, ',')   // replace space, tab, newline, return with comma
      testGenes = testGenes.split(',').filter(gene => gene) // make array and remove empty elements
      testGenes = [... new Set(testGenes)].sort()           // make unique list and sort
      const goodGenes = []
      const badGenes = []
      testGenes.forEach(gene => {
        if(this.filterPanelControls.genes.includes(gene)) {
          goodGenes.push(gene)
        } else {
          badGenes.push(gene)
        }
      })
      return { goodGenes, badGenes }
    },

    copySearchFiltersToNextPage(nextPageName) {
      const parentKey = nextPageName
      for (const [key, value] of Object.entries(this[PAGE_NAMES.SEARCH].filters)) {
        this[parentKey].filters[key] = value
      }
      this[parentKey].filters.colorCodeVariants = this[PAGE_NAMES.SEARCH].filters.colorCodeVariants
      this[parentKey].filters.showEnsIDs = this[PAGE_NAMES.SEARCH].filters.showEnsIDs
      this[parentKey].filters.showEffects = this[PAGE_NAMES.SEARCH].filters.showEffects
      this[parentKey].filters.itemsPerPage = this[PAGE_NAMES.SEARCH].filters.itemsPerPage
      this[parentKey].filters.pageNum = 1
    },

    async loadFilterData() {
      if(this.filterPanelControls.isFilterDataLoaded) return
      const { data, errorMessage, fetchData } = useFetchData()
      if(await fetchData(URLS.FILTER_DATA, 'filter data', this.currentPageName)) {
        const d = data.value
        this.filterPanelControls.analysisTypes = d.analysis_types.sort()
        this.filterPanelControls.genes = d.genes.sort()
        this.filterPanelControls.phenotypes = d.phenotypes.sort()
        this.filterPanelControls.studies = d.studies.sort()
        this.filterPanelControls.tissues = d.tissues.sort()
        this.filterPanelControls.isFilterDataLoaded = true
      } else {
        throw new Error('Error loading filter data:\n' + errorMessage)
      }
    },

    async loadManhattanData () {
      this[PAGE_NAMES.MANHATTAN].manhattanDataReady = false

      const analysisID = this[PAGE_NAMES.MANHATTAN].analysisID || sessionStorage.getItem('lastAnalysisID')

      if(!analysisID || analysisID.length === 0) {
        console.error('no analysisID to load manhattan data')
        return
      }

      sessionStorage.setItem('lastAnalysisID', analysisID)

      const href = `${URLS.TRAIT_DATA}${analysisID}/manhattan/`
      const url = new URL(href, window.location.origin)
      const { data, errorMessage, fetchData } = useFetchData()

      if(await fetchData(url, 'manhattan data', this.currentPageName)) {
        this[PAGE_NAMES.MANHATTAN].manhattanData = data.value
        this[PAGE_NAMES.MANHATTAN].manhattanDataReady = true
      } else {
        throw new Error('Error loading manhattan data:\n' + errorMessage)
      }
    },

    getPageKey(pageName, key) {
      const page = this[pageName]
      if(Object.hasOwn(page, key)) {
        return page[key]
      } else {
        throw new Error('Bad key specified for store page getter')
      }
    },

    setPageKey(pageName, key, value) {
      const page = this[pageName]
      if(Object.hasOwn(page, key)) {
        page[key] = value
        return
      } else {
        throw new Error('Bad key specified for store page setter')
      }
    },

    updateFilter(key, value) {
      // following is to ignore a double hit when changing page size in <DataTable>; page num also changes and generates event
      if(this.filterPanelControls.lastFilterUpdated === 'pageSize' && key === 'pageNum' && value === 1) return

      const parentKey = this.currentPageName
      const filters = this[parentKey].filters
      // console.log('uf:', filters)

      if(!Object.hasOwn(filters, key)) {
        throw new Error('bad key specified for filter update')
      } else {
        filters[key] = value

        if(key ==='pageSize' || !['pageSize', 'pageNum'].includes(key) ) {
          // console.log('uf: ps, pn:', filters.pageSize, filters.pageNum)
          filters.pageNum = 1
        }

        this.filterPanelControls.lastFilterUpdated = key
        this.filterPanelControls.filterDataChanged = !this.filterPanelControls.filterDataChanged
      }
    },

    async updateSort(newSort) {
      const parentKey = this.currentPageName
      this[parentKey].filters.sortKeys = newSort
      this.filterPanelControls.filterDataChanged = !this.filterPanelControls.filterDataChanged
    },

    updateSwitch(key, value) {
      const parentKey = this.currentPageName
      this[parentKey][key] = value
    },

    toggleFilterPanel() {
      this.filterPanelControls.isFilterPanelShowing = !this.filterPanelControls.isFilterPanelShowing
    },
  },
  getters: {
  }
})

function getFilterPanelSettings() {
  return {
    colorCodeVariants: true,
    showEnsIDs: false,
    showEffects: false,
    filters: {
      // these are actual filters set by the user in the UI
      studies: [],
      genes: [],
      region: '',
      phenotypes: [],
      tissues: [],
      trait1log10p: "0",
      trait2log10p: "0",
      h4: THRESHOLDS.H4,
      r2: THRESHOLDS.R2,

      // these are pseudo filters that get appended to the URL
      pageNum: "1",
      pageSize: "10",
      signals: [],
      sortKeys: [],
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
  analysisID: 'signal1_analysis', // using signal1_analysis gives the legacy behavior, using just analysis gives the desired? new behavior
  pageNum: 'page',
  pageSize: 'page_size',
  signals: 'signals',
}

// this maps data keys to the sort keys expected by the back end
const sortKeyMapAPI = {
  'coloc_h4': 'h4',
  'coloc_h3': 'h3',
  'r2': 'r2',
  'n_coloc_between_traits': 'n_coloc_between_traits',
  'signal1.neg_log_p': 'signal1_logp',
  'signal2.neg_log_p': 'signal2_logp',
  'signal1.lead_variant.chrom': 'signal1_chrom',
  'signal1.lead_variant.pos': 'signal1_pos',
  'signal1.analysis.trait.uuid': 'signal1_trait',
  'signal2.analysis.trait.uuid': 'signal2_gene_symbol',
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
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
