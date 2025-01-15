import { markRaw, toRaw } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import { useMakeColocClassPlotRecords } from '@/composables/qcMakeColocClassPlotRecords'
import { URLS } from '@/constants'
import { timeLog } from '@/util/util'

export const useQCStore = defineStore('qcStore', {
  state: () => ({
    colocAll: markRaw([]),
    colocClass: markRaw([]),
    colocForStTi: markRaw([]),
    colocWithout11: markRaw([]),
    colocWithStTiH4: markRaw([]),
    colocWithStTiH4R2: markRaw([]),
    h4Threshold: 0.5,
    r2Threshold: 0.3,
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
        this.colocAll = data.value.results
        this.qtlStudies = getQTLStudies(this.colocAll)
        this.studyList = [...this.qtlStudies.keys()]
        this.selectedStudy = this.studyList[0]
        this.selectedStudyName = this.qtlStudies.get(this.selectedStudy).study
        this.selectedTissue = this.qtlStudies.get(this.selectedStudy).tissue
        this.makeRecordsForAllPlots()
      } else {
        throw new Error('Error loading qc data:\n' + errorMessage)
      }
     },

    makeRecordsForAllPlots() {
      timeLog('making record for all plots started')
      const { makeColocClassPlotRecords } = useMakeColocClassPlotRecords();

      this.selectedStudyName = this.qtlStudies.get(this.selectedStudy).study
      this.selectedTissue = this.qtlStudies.get(this.selectedStudy).tissue

      this.colocForStTi = this.makeColocForStTi(this.colocAll)
      this.colocWithStTiH4 = this.makeColocWithStTiH4(this.colocForStTi)
      this.colocWithStTiH4R2 = this.makeColocWithStTiH4R2(this.colocForStTi)

      this.colocClass = makeColocClassPlotRecords(this.colocWithStTiH4R2)
      this.colocWithout11 = this.makeColocWithout11()

      timeLog('making record for all plots done, starting plots')
      this.regeneratePlots()
    },

    makeColocForStTi(dataSet) {
      const results = []
      for(const y of dataSet) {
        const x = toRaw(y)
        if (x.signal2.analysis.study.uuid === this.selectedStudyName &&
          x.signal2.analysis.tissue === this.selectedTissue)
        {
          results.push(x)
        }
      }
      return markRaw(results)
    },

    makeColocWithStTiH4(dataSet) {
      const results = []
      for(const y of dataSet) {
        const x = toRaw(y)
        if(x.coloc_h4 >= this.h4Threshold &&
          x.signal2.analysis.study.uuid === this.selectedStudyName &&
          x.signal2.analysis.tissue === this.selectedTissue)
        {
          results.push(x)
        }
      }
      return markRaw(results)
    },

    makeColocWithStTiH4R2(dataSet) {
      const results = []
      for(const y of dataSet) {
        const x = toRaw(y)
        if(x.coloc_h4 >= this.h4Threshold &&
          x.r2 >= this.r2Threshold &&
          x.signal2.analysis.study.uuid === this.selectedStudyName &&
          x.signal2.analysis.tissue === this.selectedTissue)
        {
          results.push(x)
        }
      }
      return markRaw(results)
    },

    makeColocWithout11() {
      const results = []
      for(const y of this.colocClass) {
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
