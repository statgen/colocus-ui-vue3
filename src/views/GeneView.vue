<template>
  <v-container fluid>
    <h1>Gene</h1>
    <p>Descriptive text...</p>
    <p class="text-caption">Sample gene: ENSG00000103351</p>

    <div class="d-flex align-center mt-5">
      <v-text-field
        v-model="theGene"
        bg-color="white"
        class="mb-n1"
        density="compact"
        flat
        label="Gene"
        variant="outlined"
        style="flex: 0 0 25rem;"
      />
      <v-btn @click="getNewGene" variant="outlined" class="ml-2 mb-5">Get new gene</v-btn>
    </div>

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
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useGenePageHelpers } from '@/composables/GenePageHelpers';

const { getTheData, table2Headers } = useGenePageHelpers();

const table2Data = ref([])
const theGene = ref('ENSG00000103351')

onMounted(async () => {
  table2Data.value = await getTheData(theGene.value)
  console.log(table2Data.value)
})

const getNewGene = async () => {
  table2Data.value = await getTheData(theGene.value)
}
</script>

<style scoped>
</style>
