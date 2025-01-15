import { makeAnalysisTitle } from '@/util/util'

export function useMakeCountsForFigures() {
  const makeCountsForFigures = (colocForStudyWithH4, allSignals, selectedStudyName, selectedTissue) => {
    // GWAS analysis -> [colocalized omics signals]
    const omicsSignalsPerGwas = new Map();

    // GWAS analysis -> [colocalized gwas signals]
    const gwasSignalsForOmicsStudy = new Map();

    // Set of all omics signals that colocalized with at least 1 GWAS
    const omicsSignalsColocalized = new Set();

    // Set of all GWAS signals that colocalized to at least 1 omics signal
    const gwasSignalsColocalized = new Set();

    // Pretty names for GWAS analyses
    const analysisNames = new Map();

    for (let c of colocForStudyWithH4) {
      let analysis1 = c.signal1.analysis.uuid;

      // Keep track of pretty analysis names
      analysisNames.set(c.signal1.analysis.uuid, makeAnalysisTitle(c.signal1.analysis));

      // Add omics signal that colocalized with this GWAS
      (omicsSignalsPerGwas.get(analysis1) ?? omicsSignalsPerGwas.set(analysis1, new Set()).get(analysis1)).add(c.signal2.uuid);

      // Add GWAS signal that colocalized with this omics study
      (gwasSignalsForOmicsStudy.get(analysis1) ?? gwasSignalsForOmicsStudy.set(analysis1, new Set()).get(analysis1)).add(c.signal1.uuid);

      // Keep track of all omics signals
      omicsSignalsColocalized.add(c.signal2.uuid);

      // Keep track of all GWAS signals
      gwasSignalsColocalized.add(c.signal1.uuid);
    }

    // Find all signals for this omics study
    const omicsSignals = new Set();
    for (let sig of allSignals) {
      if (sig.analysis.study.uuid === selectedStudyName && sig.analysis.tissue === selectedTissue) {
        omicsSignals.add(sig.uuid);
      }
    }
    const totalOmicsSignals = omicsSignals.size;

    // Find all signals per GWAS
    // GWAS analysis -> [GWAS signals colocalizing to at least 1 omics signal]
    const gwasSignals = new Map();
    const allGwasSignals = new Set();
    for (let sig of allSignals) {
      if (!gwasSignalsForOmicsStudy.has(sig.analysis.uuid)) {
        continue;
      }

      let analysis = sig.analysis.uuid;

      // Keep track of GWAS signals per GWAS analysis
      (gwasSignals.get(analysis) ?? gwasSignals.set(analysis, new Set()).get(analysis)).add(sig.uuid);

      // Set of all known GWAS signals across all analyses
      allGwasSignals.add(sig.uuid);
    }

    // Now we can assemble the final set of data records for the figure
    const byOmics = [];
    for (let [analysis, signals] of omicsSignalsPerGwas) {
      // What % of signals for this omics study colocalized with this GWAS?
      let title = analysisNames.get(analysis);
      byOmics.push({
        row: title,
        count: signals.size,
        prop: signals.size / totalOmicsSignals,
        total: totalOmicsSignals
      });
    }

    // Out of all the signals for this study, how many colocalized in total?
    byOmics.push({
      row: "All GWAS",
      count: omicsSignalsColocalized.size,
      prop: omicsSignalsColocalized.size / totalOmicsSignals,
      total: totalOmicsSignals
    })

    // Default sort by count
    byOmics.sort((a, b) => (b.count - a.count));

    // Now we do the same, but for GWAS
    // What % of GWAS signals colocalized to an OMICS signal from this OMICS study?
    const byGwas = [];
    for (let [analysis, signals] of gwasSignalsForOmicsStudy) {
      let title = analysisNames.get(analysis);
      byGwas.push({
        row: title,
        count: signals.size,
        prop: signals.size / gwasSignals.get(analysis).size,
        total: gwasSignals.get(analysis).size
      });
    }

    byGwas.push({
      row: "All GWAS",
      count: gwasSignalsColocalized.size,
      prop: gwasSignalsColocalized.size / allGwasSignals.size,
      total: allGwasSignals.size
    })

    byGwas.sort((a, b) => (b.count - a.count));
    return {
      "byOmics": byOmics,
      "byGwas": byGwas
    }
  }

  return {
    makeCountsForFigures,
  };
}
