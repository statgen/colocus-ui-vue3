<template>
  <v-col class="filter-panel-container">
    <GenePanel
      @onGeneSettingsChange="onGeneSettingsChange"
    ></GenePanel>
  </v-col>
  <v-col cols="10" class="ml-1">
  <v-container fluid>
    <h1>Gene</h1>
    <p>Descriptive text...</p>
    <p class="text-caption">Sample gene: ENSG00000103351</p>

    <div class="table-container">
      <v-data-table :headers="table2Headers" :items="table2Data">
        <template v-slot:item.gwasTrait="{ item }">{{ item.gwasTrait }}</template>
        <template v-slot:item.gwasDataset="{ item }">{{ item.gwasDataset }}</template>
        <template v-slot:item.gwasLeadVariant="{ item }">{{ item.gwasLeadVariant }}</template>
        <template v-slot:item.qtlDataset="{ item }">{{ item.qtlDataset }}</template>
        <template v-slot:item.qtlLeadVariant="{ item }">{{ item.qtlLeadVariant }}</template>
        <template v-slot:item.qtlTissue="{ item }">{{ item.qtlTissue }}</template>
        <template v-slot:item.qtlGene="{ item }">{{ item.qtlGene }}</template>
        <template v-slot:item.qtlSymbol="{ item }">{{ item.qtlSymbol }}</template>
        <template v-slot:item.otherGenesAnyTissueCount="{ item }">{{ item.otherGenesAnyTissueCount }}</template>
        <template v-slot:item.otherGenesAnyTissue="{ item }">{{ item.otherGenesAnyTissue.join(', ') }}</template>
        <template v-slot:otherGenesSameTissueCount="{ otherGenesSameTissueCount }">{{ otherGenesSameTissueCount }}</template>
        <template v-slot:item.otherGenesSameTissue="{ item }">{{ item.otherGenesSameTissue.join(', ') }}</template>
      </v-data-table>
    </div>
  </v-container>
  </v-col>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useGenePageHelpers } from '@/composables/GenePageHelpers';

const { getTheData, table2Headers } = useGenePageHelpers();

const table2Data = ref([])
const theGene = ref('ENSG00000103351')

onMounted(async () => {
  // table2Data.value = await getTheData(theGene.value)
  // console.log(table2Data.value)
})

const getNewGene = async () => {
  table2Data.value = await getTheData(theGene.value)
}

const onGeneSettingsChange = async (settings) => {
  if(settings.theGene) {
    table2Data.value = await getTheData(settings)
  } else {
    table2Data.value = []
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
