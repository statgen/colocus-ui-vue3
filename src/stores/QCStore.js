import { markRaw } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import { useQCPageHelpers } from '@/composables/qcPageHelpers'
import { URLS } from '@/constants'

export const useQCStore = defineStore('qcStore', {
  state: () => ({
    allColocData: markRaw([]),
    qtlStudies: markRaw([]),
    h4Threshold: 0.5,
    r2Threshold: 0.3,
    selectedStudy: '',
    studyList: markRaw([]),
    regenPlotFlag: true,
  }),

  actions: {
    async loadQCData() {
      const { getQTLStudies } = useQCPageHelpers()
      const { data, errorMessage, fetchData } = useFetchData()

      if(await fetchData(URLS.QC_COLOC, 'load qc data', 'qc page')) {
        this.allColocData = data.value.results
        this.qtlStudies = getQTLStudies(this.allColocData)
        this.studyList = [...this.qtlStudies.keys()]
        this.regenPlotFlag = !this.regenPlotFlag
      } else {
        throw new Error('Error loading qc data:\n' + errorMessage)
      }
    },

    updateQCStoreKey(key, value) {
      this[key] = value
      this.regenPlotFlag = !this.regenPlotFlag
    },

  },
  getters: {
  }
})

// allows hot module replacement of store in dev mode
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQCStore, import.meta.hot))
}
