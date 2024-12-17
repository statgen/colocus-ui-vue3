<template>
  <v-container class="ml-0">
    <v-row>
      <v-col>
        <h1>Colocalization statistics</h1>
        <p>Overview and description of what this page is about.</p>
      </v-col>
    </v-row>

    <v-row id="qcPanel" class="mt-5">
      <v-col>
        <span class="text-caption">
          Set H4 threshold ({{ filterH4 }})
        </span>
        <v-slider
          @end="onH4SliderUpdate"
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
          @end="onR2SliderUpdate"
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
        <v-select
          @update:modelValue="onStudySelectUpdate"
          class="mt-3"
          :items="studyList"
          v-model="selectedStudy"
          density="compact"
          label="omics"
          bg-color="white"
          flat
          variant="outlined"
          width="200"
        ></v-select>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <h2>Plot 1: Colocalization class</h2>
    </v-row>
    <v-row>
      <p>Plot 1 description</p>
    </v-row>
    <v-row>
      <v-col>
        <div id="colocClassPlot"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import embed from 'vega-embed'
import { Graph } from 'graphology'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'
import colocClassSpec from '@/vegaSpecs/colocClassSpec.js'

// *** Composables *************************************************************
const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
// data variables
let allColocData
const qtlStudies = ref({})
const studyList = ref([])

// UI control variables
const filterH4 = ref(0.5)
const filterR2 = ref(0.3)
const selectedStudy = ref('')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(async () => {
  await loadData()
  const initialStudy = studyList.value[0]
  selectedStudy.value = initialStudy

  await generatePlot(allColocData, qtlStudies, initialStudy, filterH4.value, filterR2.value)
})

// *** Event handlers **********************************************************
const onH4SliderUpdate = async (newH4value) => {
  await generatePlot(allColocData, qtlStudies, selectedStudy.value, newH4value, filterR2.value)
}

const onR2SliderUpdate = async (newR2value) => {
  await generatePlot(allColocData, qtlStudies, selectedStudy.value, filterH4.value, newR2value)
}

const onStudySelectUpdate = async (newStudy) => {
  await generatePlot(allColocData, qtlStudies, newStudy, filterH4.value, filterR2.value)
}

// *** Utility functions *******************************************************
const generatePlot = async (colocData, qtlStudies, study, h4, r2) => {
  console.log(`Building plot for ${study}, h4=${h4}, r2=${r2}`)
  const cfs = getColocDataForStudy(colocData, qtlStudies, study, h4, r2)

  const records = makePlotRecords(cfs)

  const plotContainer = '#colocClassPlot'
  colocClassSpec.data.values = records
  await embed(plotContainer, colocClassSpec)
}

const loadData = async() => {
  if(await fetchData(URLS.QC_COLOC, 'gene check', appStore.currentPageName)) {
    allColocData = data.value.results
  } else {
    console.error('Error loading qc data:', errorMessage)
  }

  qtlStudies.value = getQTLStudies(allColocData)

  studyList.value = [...qtlStudies.value.keys()]

  const initialStudy = studyList.value[0]
  selectedStudy.value = initialStudy
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

// ***** records *************************************************************
const makePlotRecords = (colocForStudy) => {
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


// *** Configuration data ******************************************************
</script>

<style scoped>
#qcPanel {
  border: 1px solid #ddd;
  height: 90px;
}
</style>
