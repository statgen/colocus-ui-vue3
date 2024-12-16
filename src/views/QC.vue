<template>
  <v-container class="ml-0">
    <v-row>
      <h1>Bonjour, le monde</h1>
    </v-row>
    <v-row class="mt-4">
      <div id="vega">Ca va?</div>
    </v-row>
    <v-row id="qcPanel">
      <v-col>
        <span class="text-caption">
          Set H4 threshold ({{ filterH4 }})
        </span>
        <v-slider
          v-model="filterH4"
          :min="0"
          :max="1.0"
          :step="0.05"
          show-ticks="always"
          thumb-size="14"
          width="200"
        ></v-slider>
      </v-col>

      <v-col>
        <span class="text-caption">
          Set r<sup>2</sup> threshold ({{ filterR2 }})
        </span>
        <v-slider
          v-model="filterR2"
          :min="0"
          :max="1.0"
          :step="0.05"
          show-ticks="always"
          thumb-label
          thumb-size="14"
          width="200"
        ></v-slider>
      </v-col>
      <v-col>
<!--        <span>omics</span>-->
        <v-select
          :items="Object.keys(qtlStudies)"
          v-model="selectedOmicsStudy"
          density="compact"
          label="omics"
          bg-color="white"
          flat
          variant="outlined"
          width="200"
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="spec1"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { onMounted, ref } from 'vue'
import embed from 'vega-embed'
import { Graph } from 'graphology'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'
import spec1 from '@/vegaSpecs/spec.js'

// *** Composables *************************************************************
const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
let allColoc
let coloc

const qtlStudies = {
  "LiverQTL (liver)": { "study": "LiverQTL", "tissue": "liver" },
  "AdipoExpress (adipose)": { "study": "AdipoExpress", "tissue": "adipose" },
  "FUSION (muscle)": { "study": "FUSION", "tissue": "muscle" },
  "INSPIRE (islet)": { "study": "INSPIRE", "tissue": "islet"},
}

// const omicsList = ref(Object.keys(qtlStudies))

// UI variables
const filterH4 = ref(0.5)
const filterR2 = ref(0.3)
const selectedOmicsStudy = ref('LiverQTL (liver)')


// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  const r = '#vega'
  const x = await embed(r, spec)

  if(await fetchData(URLS.QC_COLOC, 'gene check', appStore.currentPageName)) {
    allColoc = data.value.results
    console.log('acv:', allColoc)
  }

  // ***** coloc ***************************************************************
  coloc = allColoc.filter((x) => {
    // console.log('x', x)
    const omicsStudyName = selectedOmicsStudy.value
    const omicsStudy = qtlStudies[omicsStudyName]
    const study = omicsStudy.study
    const tissue = omicsStudy.tissue

    // console.log('ost', omicsStudy, study, tissue)
    return (x.r2 > filterR2.value) &&
      (x.coloc_h4 > filterH4.value) &&
      (x.signal2.analysis.study.uuid === study) &&
      (x.signal2.analysis.tissue === tissue);
  })
  console.log('coloc:', coloc)

  // ***** records *************************************************************
  // records = {
    // Build graph of colocalizations
    // GWAS analysis trait <--> GWAS variant <--> eQTL variant <--> eQTL analysis gene
    // Note: the analysis part here is important. There could be multiple analyses for the same GWAS trait. For example,
    // if two different analysts or consortia analyzed a particular trait, they would be separate analyses.
    // For now, trait 1 is always GWAS, and trait 2 is always eQTL.
    const graph = new Graph();
    const analysisPairs = new Map();
    const analysisNames = new Map();
    for (let c of coloc) {
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

  // return records
  console.log('records', records)
// }

  const r1 = '#spec1'
  spec1.data.values = records
  const xx = await embed(r1, spec1)
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
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

// *** Configuration data ******************************************************
const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"a": "C", "b": 2},
      {"a": "C", "b": 7},
      {"a": "C", "b": 4},
      {"a": "D", "b": 1},
      {"a": "D", "b": 2},
      {"a": "D", "b": 6},
      {"a": "E", "b": 8},
      {"a": "E", "b": 4},
      {"a": "E", "b": 7}
    ]
  },
  "height": 200,
  "width": 400,
  "title": "Vega lite embed example",
  "mark": "bar",
  "encoding": {
    "y": {"field": "a", "type": "nominal"},
    "x": {
      "aggregate": "average",
      "field": "b",
      "type": "quantitative",
      "axis": {
        "title": "Average of b"
      }
    }
  }
}

</script>

<style scoped>
#qcPanel {
  border: 1px solid #ddd;
  margin: 5px 0 5px 0;
  padding: 20px 0 -10px 0 !important;
}
</style>
