<template>
  <v-col v-show="appStore.filterPanelControls.isSidebarShowing" class="filter-panel-container">
    <GenePanel></GenePanel>
  </v-col>

  <v-col :cols="appStore.filterPanelControls.isSidebarShowing ? 10 : 12" class="ml-2">
    <v-container fluid>
      <h1><BackButton />{{ pageHeader }}</h1>
      <h2>Table 1</h2>
      <p>
        Summary of GWAS signals associated with {{ selectedGene }} and other genes associated with the same GWAS signal in the same tissue.
        <span class="font-weight-bold">Grouped by lead GWAS variant (can have multiple GWASs with the same lead GWAS variant).</span>
      </p>
      <div class="table-container mt-2">
        <v-data-table :headers="visibleTable1Columns" :items="table1Data" density="compact" class="data-table-base">
          <template v-slot:item.qtlTissue="{ item }">{{ item.qtlTissue }}</template>
          <template v-slot:item.qtlStudy="{ item }">{{ item.qtlStudy }}</template>
          <template v-slot:item.gwasLeadVariant="{ item }"><VariantLabel :variant="item.gwasLeadVariant" :showSplotch="true" /></template>
          <template v-slot:item.traitsColocalizedCount="{ item }">{{ item.traitsColocalizedCount }}</template>
          <template v-slot:item.traitsColocalized="{ item }">{{ item.traitsColocalized }}</template>
          <template v-slot:item.otherGenesSameTissueCount="{ item }">{{ item.otherGenesSameTissueCount }}</template>
          <template v-slot:item.otherGenesSameTissue="{ item }">
            <template v-for="(gene, index) in item.otherGenesSameTissue.split(',')" :key="index">
              <SimpleGeneLabel :gene="gene" />
              <span v-if="index < item.otherGenesSameTissue.split(',').length - 1">, </span>
            </template>
          </template>
        </v-data-table>
      </div>

      <h2>Table 2</h2>
      <p>
        Summary of GWAS signals associated with {{ selectedGene }} and other genes associated with the same GWAS signal in the same tissue and other tissues.
        <span class="font-weight-bold">Grouped by each associated GWAS trait and lead variant.</span>
      </p>
      <div class="table-container">
        <v-data-table :headers="visibleTable2Columns" :items="table2Data" density="compact" class="data-table-base">
          <template v-slot:item.gwasStudy="{ item }">{{ item.gwasStudy }}</template>
          <template v-slot:item.gwasTrait="{ item }">{{ item.gwasTrait }}</template>
          <template v-slot:item.gwasType="{ item }">{{ item.gwasType }}</template>

          <template v-slot:item.qtlStudy="{ item }">{{ item.qtlStudy }}</template>
          <template v-slot:item.qtlSymbol="{ item }">{{ item.qtlSymbol }}</template>
          <template v-slot:item.qtlType="{ item }">{{ item.qtlType }}</template>
          <template v-slot:item.qtlTrait="{ item }"><EnsgLabel :trait="item.qtlTrait" /></template>
          <template v-slot:item.qtlTissue="{ item }">{{ item.qtlTissue }}</template>

          <template v-slot:item.gwasLeadVariant="{ item }"><VariantLabel :variant="item.gwasLeadVariant" :showSplotch="true" /></template>
          <template v-slot:item.qtlLeadVariant="{ item }"><VariantLabel :variant="item.qtlLeadVariant" :showSplotch="true" /></template>

          <template v-slot:item.otherGenesSameTissueCount="{ item }">{{ item.otherGenesSameTissueCount }}</template>
          <template v-slot:item.otherGenesSameTissue="{ item }">
            <template v-for="(gene, index) in item.otherGenesSameTissue.split(',')" :key="index">
              <SimpleGeneLabel :gene="gene" />
              <span v-if="index < item.otherGenesSameTissue.split(',').length - 1">, </span>
            </template>
          </template>

          <template v-slot:item.otherGenesAnyTissueCount="{ item }">{{ item.otherGenesAnyTissueCount }}</template>
          <template v-slot:item.otherGenesAnyTissue="{ item }">
            <template v-for="(gene, index) in item.otherGenesAnyTissue.split(',')" :key="index">
              <SimpleGeneLabel :gene="gene" />
              <span v-if="index < item.otherGenesAnyTissue.split(',').length - 1">, </span>
            </template>
          </template>

          <template v-slot:item.qtlDataset="{ item }">{{ item.qtlDataset }}</template>
          <template v-slot:item.gwasDataset="{ item }">{{ item.gwasDataset }}</template>
        </v-data-table>
      </div>
    </v-container>
  </v-col>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, nextTick, onMounted, shallowRef, toRaw, watch } from 'vue'
import { useRoute, useRouter } from "vue-router"
import { useGenePageHelpers } from '@/composables/GenePageHelpers';
import { PAGE_NAMES, THRESHOLDS } from "@/constants";
import { useAppStore } from '@/stores/AppStore'

// *** Composables *************************************************************
const appStore = useAppStore()
const { getGeneData, getTable1Data, getTable2Data, visibleTable1Columns, visibleTable2Columns } = useGenePageHelpers();

const router = useRouter()
const route = useRoute()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const table1Data = shallowRef([])
const table2Data = shallowRef([])

const genePage = PAGE_NAMES.GENE

appStore.slidersEnabled = false

// *** Computed ****************************************************************
const pageHeader = computed(() => {
  return appStore[genePage].selectedGene
    ? `Gene: ${appStore[genePage].selectedGene}`
    : 'Gene'
})

const selectedGene = computed(() => {
  return appStore[genePage].selectedGene
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(
  [
    () => appStore[genePage].selectedGene,
  ],
  async () => {
    const theGene = appStore[genePage].selectedGene
    if(!theGene) {
      clearData()
      appStore.slidersEnabled = false
      await updateGeneRoute(undefined)
      return
    }
    appStore[genePage].h4 = THRESHOLDS.H4
    appStore[genePage].r2 = THRESHOLDS.R2
    await loadData()
    appStore.slidersEnabled = true
    if(appStore[genePage].updateRoute) await updateGeneRoute(theGene)
  }
)

watch(
  [
    () => appStore[genePage].h4,
    () => appStore[genePage].r2
  ],
  async () => {
    await loadData()
  }
)

watch(
  () => route.query.gene,
  () => {
    const theGene = route.query.gene
    appStore[genePage].updateRoute = false
    appStore[genePage].selectedGene = theGene
  }
)

watch(
  () => appStore.clearData,
  () => {
    clearData()
  }
)

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  const theGene = route.query?.gene?.split(',')[0]?.trim()?.toUpperCase() // in case someone sends a comma list
  if(!validateGene(theGene)) {
    appStore[genePage].selectedGene = undefined
    updateGeneRoute(undefined)
    return
  }
  updateGeneRoute(theGene)
  appStore[genePage].updateRoute = false
  appStore[genePage].selectedGene = theGene
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const validateGene = (gene) => {
  if(!gene || !appStore.checkGene(gene)) return false
  return true
}

const clearData = () => {
  table1Data.value = []
  table2Data.value = []
}

const loadData = async () => {
  const theGene = appStore[genePage].selectedGene
  if(!validateGene(theGene)) return

  const settings = {
    theGene,
    h4: appStore[genePage].h4,
    r2: appStore[genePage].r2,
  }

  clearData()

  // note: table2 has to be built before table1
  const t2 = toRaw(await getTable2Data(settings))
  if(t2.length < 1) return

  table2Data.value = t2

  table1Data.value = toRaw(await getTable1Data(t2))
  await nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const updateGeneRoute = async (newGene) => {
  await router.push({
    name: genePage,
    query: { gene: newGene }
  })
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: scroll;
}

.data-table-base {
  font-size: 1rem;
  line-height: 1.3;
}
</style>
