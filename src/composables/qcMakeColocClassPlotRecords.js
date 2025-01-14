import { Graph } from 'graphology'

export function useMakeColocClassPlotRecords() {
  function makeAnalysisTitle(analysis) {
    // let year = analysis.publication?.year ?? 'NA';
    return `${analysis.study.uuid} • ${analysis.trait.uuid}`;
  }

  function colocTypeLabel(t) {
    if (t === 'moreThanTwoGwasPerEqtlSignal' ) {
      return 'QTL variant has 2+ GWAS signals';
    }
    if (t === 'moreThanTwoQtlPerGwasSignal') {
      return 'GWAS variant has 2+ QTL signals';
    }
    if (t === 'oneToOneSignal') {
      return 'One-to-one GWAS:eQTL signal';
    }
  }

  const makeColocClassPlotRecords = (colocData, qtlStudies, studyName, h4, r2) => {
    const cdfs = getColocDataForStudy(colocData, qtlStudies, studyName, h4, r2)
    const records = makeRecords(cdfs)
    return records
  }

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

  const makeRecords = (colocForStudy) => {
    // Build graph of colocalizations
    // GWAS analysis trait <--> GWAS variant <--> eQTL variant <--> eQTL analysis gene
    // Note: the analysis part here is important. There could be multiple analyses for the same GWAS trait. For example,
    // if two different analysts or consortia analyzed a particular trait, they would be separate analyses.
    // For now, trait 1 is always GWAS, and trait 2 is always eQTL.
    const graph = new Graph();
    const analysisPairs = new Map();
    const analysisNames = new Map();
    for (let c of colocForStudy) {
      let analysis1 = c.signal1.analysis.uuid;
      let analysis2 = c.signal2.analysis.uuid;
      let a1_variant = c.signal1.lead_variant.vid;
      let a2_variant = c.signal2.lead_variant.vid;

      // This plot will currently only work for GWAS by X colocalizations.
      if (c.signal1.analysis.analysis_type != 'GWAS') {
        continue;
      }

      // Make a prettier title for this analysis
      analysisNames.set(analysis1, makeAnalysisTitle(c.signal1.analysis));

      // Remember valid analysis pairs
      const a1_map = analysisPairs.get(analysis1) ?? analysisPairs.set(analysis1, new Set()).get(analysis1);
      a1_map.add(analysis2);

      // Strange nomenclature. This just adds a node into the graph if it doesn't already exist.
      graph.mergeNode(analysis1);
      graph.mergeNode(analysis2);
      graph.mergeNode(a1_variant);
      graph.mergeNode(a2_variant);

      // Same as above; add edges if they don't already exist.
      graph.mergeEdge(analysis1, a1_variant);
      graph.mergeEdge(analysis2, a2_variant);

      graph.mergeEdge(a1_variant, a2_variant);
      graph.mergeEdge(a2_variant, a1_variant);
    }

    const records = [];
    // Iterate over valid pairs of analyses
    // An analysis is a "tuple" of (dataset, trait), e.g. "gwas_ukbb_LDL_hg19
    // Below I'm dropping the trait1/trait2 and calling them what they are; at some point we will have to revisit this
    // plot when we have colocalizations where neither signal is from a GWAS. Currently the rows of the plot are per GWAS
    // analysis.
    for (let [analysis1, analysis2s] of analysisPairs) {
      let moreThanTwoQtlPerGwasSignal = 0;
      let moreThanTwoGwasPerEqtlSignal = 0;
      let oneToOneSignal = 0;

      for (let analysis2 of analysis2s) {
        let qtlVariants = graph.outNeighbors(analysis2);

        for (let q of qtlVariants) {
          // What GWAS variants are associated with this eQTL variant?
          let qOut = graph.outNeighbors(q).filter(v => graph.inNeighbors(v).includes(analysis1));

          // Count the number of GWAS variants that are associated with this eQTL variant - are >= 2?
          if (qOut.length >= 2) moreThanTwoGwasPerEqtlSignal++;

          // Iterate over GWAS variants associated with this eQTL variant
          for (let g of graph.outNeighbors(q)) {
            // We want to find out how many QTL variants this GWAS variant has, but only if the QTL variant is from
            // the correct analysis
            let gOut = graph.outNeighbors(g).filter(v => graph.inNeighbors(v).includes(analysis2));

            // Did this GWAS variant have more than 2 QTL variants?
            if (gOut.length >= 2) moreThanTwoQtlPerGwasSignal++;

            // If the QTL variant only had one GWAS variant, and the GWAS variant only had one QTL variant,
            // then we have a 1:1 colocalization
            if (qOut.length === 1 && gOut.length === 1) oneToOneSignal++;
          }
        }
      }

      // Clean up analysis name for display
      //let analysis1Display = analysis1.replace("gwas_", "").replace("_hg19", "").replace(/_[^_]+$/, "")
      let analysis1Display = analysisNames.get(analysis1);

      // Add records for plotting
      if (oneToOneSignal > 0) {
        records.push({
          gwasAnalysis: analysis1Display,
          variable: "oneToOneSignal",
          value: oneToOneSignal,
        });
      }

      if (moreThanTwoGwasPerEqtlSignal > 0) {
        records.push({
          gwasAnalysis: analysis1Display,
          variable: "moreThanTwoGwasPerEqtlSignal",
          value: moreThanTwoGwasPerEqtlSignal,
        });
      }

      if (moreThanTwoQtlPerGwasSignal > 0) {
        records.push({
          gwasAnalysis: analysis1Display,
          variable: "moreThanTwoQtlPerGwasSignal",
          value: moreThanTwoQtlPerGwasSignal,
        });
      }
    }

    // Define sort order
    let sortOrder = {
      "oneToOneSignal": 0,
      "moreThanTwoGwasPerEqtlSignal": 1,
      "moreThanTwoQtlPerGwasSignal": 2
    }

    // Calculate totals
    let totals = {};
    for (let r of records) {
      totals[r.gwasAnalysis] = (totals[r.gwasAnalysis] ?? 0) + r.value;
    }

    // Add a readable label for each variable
    // Add sort order needed for vega issue with ordering of stacked bars
    // Add totals
    records.map((x) => {
      x.variableLabel = colocTypeLabel(x.variable);
      x.sortIndex = sortOrder[x.variable];
      x.totalForGwas = totals[x.gwasAnalysis];
      x.propOfGwas = (x.value / totals[x.gwasAnalysis]);
    })

    // Sort by oneToOneSignal's value.
    records.sort((a, b) => {
      let aVar = a.variable;
      let bVar = b.variable;

      if (aVar === "oneToOneSignal" && bVar === "oneToOneSignal") {
        return (b.value - a.value)
      }
      if (aVar === "moreThanTwoGwasPerEqtlSignal" && bVar === "moreThanTwoGwasPerEqtlSignal") {
        return (b.value - a.value)
      }
      if (aVar === "moreThanTwoQtlPerGwasSignal" && bVar === "moreThanTwoQtlPerGwasSignal") {
        return (b.value - a.value)
      }

      if (bVar === "oneToOneSignal") {
        return 1;
      }
      if (aVar === "oneToOneSignal") {
        return -1;
      }
      if (bVar === "moreThanTwoQtlPerGwasSignal") {
        return -1;
      }
      if (bVar === "moreThanTwoGwasPerEqtlSignal") {
        return 1;
      }
    })
    return records
  }


  return {
    makeColocClassPlotRecords,
  };
}
