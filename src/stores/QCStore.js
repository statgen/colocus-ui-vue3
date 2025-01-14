import { markRaw, toRaw } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import { useMakeColocClassPlotRecords } from '@/composables/qcMakeColocClassPlotRecords'
import { URLS } from '@/constants'

export const useQCStore = defineStore('qcStore', {
  state: () => ({
    allColocData: markRaw([]),
    h4Threshold: 0.5,
    r2Threshold: 0.3,
    recordsColocClass: markRaw([]),
    recordsColocForStudy: markRaw([]),
    recordsWithoutOneToOne: markRaw([]),
    qtlStudies: markRaw([]),
    regenPlotFlag: true,
    selectedStudy: '',      // full name: <study> (<tissue>)
    selectedStudyName: '',  // just study name
    selectedTissue: '',
    studyList: markRaw([]),
  }),

  actions: {
    async loadQCData() {
      const { data, errorMessage, fetchData } = useFetchData()

      if(await fetchData(URLS.QC_COLOC, 'load qc data', 'qc page')) {
        this.allColocData = data.value.results
        this.qtlStudies = getQTLStudies(this.allColocData)
        this.studyList = [...this.qtlStudies.keys()]
        this.selectedStudy = this.studyList[0]
        this.makeRecordsForAllPlots()
      } else {
        throw new Error('Error loading qc data:\n' + errorMessage)
      }
    },

    makeRecordsForAllPlots() {
      const { makeColocClassPlotRecords } = useMakeColocClassPlotRecords();

      this.selectedStudyName = this.qtlStudies.get(this.selectedStudy).study
      this.selectedTissue = this.qtlStudies.get(this.selectedStudy).tissue

      this.recordsColocClass = makeColocClassPlotRecords(this.allColocData, this.qtlStudies, this.selectedStudy, this.h4Threshold, this.r2Threshold)
      this.recordsWithoutOneToOne = this.makeRecordsWithoutOneToOne()
      this.recordsColocForStudy = this.makeRecordsColocForStudy()

      this.regeneratePlots()
    },

    makeRecordsColocForStudy() {
      const results = []
      for(const y of this.allColocData) {
        const x = toRaw(y)
        if (x.signal2.analysis.study.uuid === this.selectedStudyName &&
          x.signal2.analysis.tissue === this.selectedTissue)
        {
          results.push(x)
        }
      }
      return markRaw(results)
    },

    makeRecordsWithoutOneToOne() {
      const results = []
      for(const y of this.recordsColocClass) {
        const x = toRaw(y)
        if(x.variable !== 'oneToOneSignal') results.push(x)
      }
      return markRaw(results)
    },

    regeneratePlots() {
      this.regenPlotFlag = !this.regenPlotFlag
    },

    updateQCStoreKey(key, value) {
      this[key] = value
      this.makeRecordsForAllPlots()
    },
  },
  getters: {
  }
})

const getQTLStudies = (colocData) => {
  const qs = new Map(colocData.map(x => {
    let k = `${x.signal2.analysis.study.uuid} (${x.signal2.analysis.tissue})`
    let v = {
      study: x.signal2.analysis.study.uuid,
      tissue: x.signal2.analysis.tissue
    }
    return [k, v]
  }))
  return qs
}

// allows hot module replacement of store in dev mode
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQCStore, import.meta.hot))
}
