import { useQCPlotRecords } from '@/composables/qcPlotRecords'
import embed from 'vega-embed'

const { makePlotRecords } = useQCPlotRecords();

export function useQCPageHelpers() {

  const generatePlot = async (container, spec, colocData, qtlStudies, study, h4, r2) => {
    console.log(`Building plot for ${study}, h4=${h4}, r2=${r2}, domID=${container}`)
    console.log('container', document.querySelector('#plot1'))

    const cfs = getColocDataForStudy(colocData, qtlStudies, study, h4, r2)
    spec.data.values = makePlotRecords(cfs)
    // debugger
    await embed(container, spec)
  }

  const getColocDataForStudy = (colocData, qtlStudies, studyName, h4, r2) => {
    const cfs = colocData.filter((x) => {
      const omicsStudy = qtlStudies.get(studyName)
      const study = omicsStudy.study
      const tissue = omicsStudy.tissue

      return (x.r2 >= r2) &&
        (x.coloc_h4 >= h4) &&
        (x.signal2.analysis.study.uuid === study) &&
        (x.signal2.analysis.tissue === tissue);
    })
    return cfs
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


  return {
    generatePlot,
    getColocDataForStudy,
    getQTLStudies,
  };
}
