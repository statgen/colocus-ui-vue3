<template>
  <v-col v-show="appStore.filterPanelControls.isSidebarShowing" class="filter-panel-container">
    <GenePanel></GenePanel>
  </v-col>

  <v-col :cols="appStore.filterPanelControls.isSidebarShowing ? 10 : 12" class="ml-2">
    <v-container fluid>
      <h1>{{ pageHeader }}</h1>
      <p>Descriptive text...</p>
      <p class="text-caption">Sample gene: ENSG00000103351</p>

      <div class="table-container">
        <v-data-table :headers="visibleColumns" :items="table2Data" density="compact">
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
          <template v-slot:item.otherGenesSameTissue="{ item }">{{ item.otherGenesSameTissue }}</template>
          <template v-slot:item.otherGenesAnyTissueCount="{ item }">{{ item.otherGenesAnyTissueCount }}</template>
          <template v-slot:item.otherGenesAnyTissue="{ item }">{{ item.otherGenesAnyTissue }}</template>

          <template v-slot:item.qtlDataset="{ item }">{{ item.qtlDataset }}</template>
          <template v-slot:item.gwasDataset="{ item }">{{ item.gwasDataset }}</template>
        </v-data-table>
      </div>
    </v-container>
  </v-col>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useGenePageHelpers } from '@/composables/GenePageHelpers';
import { PAGE_NAMES, THRESHOLDS } from "@/constants";
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()
const { getTheData, visibleColumns } = useGenePageHelpers();

const table1Data = ref([])
const table2Data = ref([])

const genePage = PAGE_NAMES.GENE

const pageHeader = computed(() => {
  return appStore[genePage].selectedGene
    ? `Gene: ${appStore[genePage].selectedGene}`
    : 'Gene'
})

watch(
  [
    () => appStore[genePage].selectedGene,
  ],
  async () => {
    appStore[genePage].h4 = THRESHOLDS.H4
    appStore[genePage].r2 = THRESHOLDS.R2
    await loadData()
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

const loadData = async () => {
  const settings = {
    theGene: appStore[genePage].selectedGene,
    h4: appStore[genePage].h4,
    r2: appStore[genePage].r2,
  }
  if(settings.theGene) {
    const allData = await getTheData(settings)
    table1Data.value = allData.table1data
    table2Data.value = allData.table2data
    appStore[genePage].slidersEnabled = true
  } else {
    table2Data.value = []
    appStore[genePage].slidersEnabled = false
  }
}
</script>

<style scoped>
.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: auto;
}
</style>
