export function useQCPageHelpers() {
  const getColocDataForStudy = (colocData, qtlStudies, studyName, h4, r2) => {
    const cfs = colocData.filter((x) => {
      const omicsStudy = qtlStudies.value.get(studyName)
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
    getColocDataForStudy,
    getQTLStudies,
  };
}
