import _ from 'lodash'

export function useMakeSignalsPerDataset() {
  const makeSignalsPerDataset = (allSignals) => {
    const signalsPerDataset = new Map();
    const datasetToLabel = new Map();

    for (let sig of allSignals) {
      let tissueLabel = "";
      if (sig.analysis.tissue) {
        tissueLabel = ` • ${sig.analysis.tissue}`;
      } else {
        tissueLabel = "";
      }

      let study = sig.analysis.study.uuid;
      let analysisType = sig.analysis.analysis_type;

      let trait = sig.analysis.trait.uuid;
      let traitLabel = "";
      if (analysisType === 'GWAS') {
        traitLabel = ` • ${trait}`;
      } else {
        traitLabel = ` • eQTL`;
      }

      // This is a hack to get at "dataset" concept; this will be in API next release
      let dataset = sig.analysis.uuid.replace(/_([A-Za-z0-9\.]+)$/, "").replace(/_ENSG.*/, "");
      let datasetLabel = `${study}${traitLabel}${tissueLabel}`;

      datasetToLabel.set(dataset, datasetLabel);
      (signalsPerDataset.get(dataset) ?? signalsPerDataset.set(dataset, new Set()).get(dataset)).add(sig.uuid);
    }

    function sortMapByKeys(map) {
      const sortedArray = _.sortBy(Array.from(map), ([key]) => key);
      return new Map(sortedArray);
    }

    const sortedSignalsPerDataset = sortMapByKeys(signalsPerDataset);

    const a = Array.from(sortedSignalsPerDataset, ([key, set]) => ({dataset: key, count: set.size}))

    return a
  }

  return {
    makeSignalsPerDataset,
  }
}
