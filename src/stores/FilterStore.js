import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import router from '@/router'
import { pageStoreDataMap } from '@/constants'

export const useFilterStore = defineStore('filterStore', {
  state: () => ({
    isFilterDataLoaded: false,
    isFilterButtonShowing: true,
    isFilterPanelShowing: true,
    countPairs: 0,
    staticData: {
      genes: [],
      phenotypes: [],
      studies: [],
      tissues: [],
      traits: [],
    },
    searchPageData: {
      filters: {
        studies: [],
        genes: [],
        region: '',
        phenotypes: [],
        tissues: [],
        trait1log10p: "0",
        trait2log10p: "0",
        h4: ".5",
        r2: ".3",
        showEnsIDs: false,
        showEffects: false,
      }
    },
    locusZoomPageData: {
    filters: {
      studies: [],
      genes: [],
      region: '',
      phenotypes: [],
      tissues: [],
      trait1log10p: "0",
      trait2log10p: "0",
      h4: ".5",
      r2: ".33",
      showEnsIDs: false,
      showEffects: false,
    }
  },
  }),
  actions: {
    async loadFilterData() {
      const { data, isLoading, hasError, errorMessage, fetchData } = useFetchData();

      await fetchData('/api/v1/internal/search_metadata/');

      if(hasError.value) {
        throw new Error(errorMessage.value)

      } else {
        const d = data.value
        this.countPairs = d.count_pairs
        this.staticData.genes = d.genes.sort()
        this.staticData.phenotypes = d.phenotypes.sort()
        this.staticData.studies = d.studies.sort()
        this.staticData.tissues = d.tissues.sort()
        this.staticData.traits = d.trait_types.sort()

        this.isFilterDataLoaded = true
      }
    },
    updateFilters(key, value) {
      const route = router.currentRoute.value
      const routeName = route.name
      const parentKey = pageStoreDataMap[routeName]
      this[parentKey].filters[key] = value
    },
    toggleFilterPanel() {
      this.isFilterPanelShowing = !this.isFilterPanelShowing
    },
    copySearchFiltersToLZ() {
      for (const [key, value] of Object.entries(this.searchPageData.filters)) {
        this.locusZoomPageData.filters[key] = value
      }
    },
  },
  getters: {
  }
})

// allows hot module replacement of store in dev mode
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilterStore, import.meta.hot))
}
