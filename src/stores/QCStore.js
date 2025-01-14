import { markRaw } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetchData } from '@/composables/fetchData'
import { useMakeQCPlotRecords } from '@/composables/qcMakePlotRecords'
import { URLS } from '@/constants'

export const useQCStore = defineStore('qcStore', {
  state: () => ({
    allColocData: markRaw([]),
    h4Threshold: 0.5,
    r2Threshold: 0.3,
    recordsColocClass: markRaw([]),
    recordsWithoutOneToOne: [],
    qtlStudies: markRaw([]),
    regenPlotFlag: true,
    selectedStudy: '',
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
        this.makePlotRecords()
      } else {
        throw new Error('Error loading qc data:\n' + errorMessage)
      }
    },

    makePlotRecords() {
      const { makePlotRecords } = useMakeQCPlotRecords();
      const cdfs = getColocDataForStudy(this.allColocData, this.qtlStudies, this.selectedStudy, this.h4Threshold, this.r2Threshold)
      this.recordsColocClass = makePlotRecords(cdfs)
      this.recordsWithoutOneToOne = this.recordsColocClass.filter((x) => !(x.variable === 'oneToOneSignal'))
      this.regeneratePlots()
    },

    regeneratePlots() {
      this.regenPlotFlag = !this.regenPlotFlag
    },

    updateQCStoreKey(key, value) {
      this[key] = value
      this.makePlotRecords()
    },
  },
  getters: {
  }
})

const getColocDataForStudy = (colocData, qtlStudies, studyName, h4, r2) => {
  const omicsStudy = qtlStudies.get(studyName)
  const study = omicsStudy.study
  const tissue = omicsStudy.tissue

  const cdfs = colocData.filter((x) => {
    return (x.r2 >= r2) &&
      (x.coloc_h4 >= h4) &&
      (x.signal2.analysis.study.uuid === study) &&
      (x.signal2.analysis.tissue === tissue);
  })
  return cdfs
}

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
