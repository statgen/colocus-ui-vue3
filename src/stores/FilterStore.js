import { defineStore, acceptHMRUpdate } from 'pinia';

export const useFilterStore = defineStore('filterStore', {
  state: () => ({
    isFilterPanelShowing: true,
    isFilterButtonShowing: true,
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
      showEnsIDs: false,
      showEffects: false,
    }
  }),
  actions: {
    updateFilters(keyValueObject) {
      const [key, value] = Object.entries(keyValueObject)[0]
      if(key in this.filters) {
        this.filters[key] = value;
      } else {
        throw new Error(`Bad filter key specified: ${key}`)
      }
    },
  },
  getters: {
    getFilterValue: (state) => {
      return (key) => state.filters[key];
    },
  }
})

// allows hot module replacement of store in dev mode
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilterStore, import.meta.hot))
}
