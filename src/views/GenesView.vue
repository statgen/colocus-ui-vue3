<template>
  <v-container>
    <h1>Genes</h1>
    <p>Data:</p>
    <v-data-table :headers="headers" :items="theData">
      <template v-slot:gwasTrait="{ gwasTrait }">{{ gwasTrait }}</template>
      <template v-slot:gwasDataset="{ gwasDataset }">{{ gwasDataset }}</template>
      <template v-slot:gwasLeadVariant="{ gwasLeadVariant }">{{ gwasLeadVariant }}</template>
      <template v-slot:qtlDatset="{ qtlDatset }">{{ qtlDatset }}</template>
      <template v-slot:qtlLeadVariant="{ qtlLeadVariant }">{{ qtlLeadVariant }}</template>
      <template v-slot:qtlTissue="{ qtlTissue }">{{ qtlTissue }}</template>
      <template v-slot:qtlGene="{ qtlGene }">{{ qtlGene }}</template>
      <template v-slot:qtlSymbol="{ qtlSymbol }">{{ qtlSymbol }}</template>
      <template v-slot:otherGenesAnyTissueCount="{ otherGenesAnyTissueCount }">{{ otherGenesAnyTissueCount }}</template>
      <template v-slot:item.otherGenesAnyTissue="{ item }">
        {{ item.otherGenesAnyTissue.join(', ') }}
      </template>
      <template v-slot:otherGenesSameTissueCount="{ otherGenesSameTissueCount }">{{ otherGenesSameTissueCount }}</template>
      <template v-slot:item.otherGenesSameTissue="{ item }">
        {{ item.otherGenesSameTissue.join(', ') }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useGenePageHelpers } from '@/composables/GenePageHelpers';

const { getTheData } = useGenePageHelpers();

const theData = ref([])

const headers = [
  { title: 'gwasTrait', value: 'gwasTrait', sortable: true, },
  { title: 'gwasDataset', value: 'gwasDataset', sortable: true, },
  { title: 'gwasLeadVariant', value: 'gwasLeadVariant', sortable: true, },
  { title: 'qtlDatset', value: 'qtlDatset', sortable: true, },
  { title: 'qtlLeadVariant', value: 'qtlLeadVariant', sortable: true, },
  { title: 'qtlTissue', value: 'qtlTissue', sortable: true, },
  { title: 'qtlGene', value: 'qtlGene', sortable: true, },
  { title: 'qtlSymbol', value: 'qtlSymbol', sortable: true, },
  { title: 'otherGenesAnyTissueCount', value: 'otherGenesAnyTissueCount', sortable: true, },
  { title: 'otherGenesAnyTissue', value: 'otherGenesAnyTissue', sortable: true, },
  { title: 'otherGenesSameTissueCount', value: 'otherGenesSameTissueCount', sortable: true, },
  { title: 'otherGenesSameTissue', value: 'otherGenesSameTissue', sortable: true, },
]

onMounted(async () => {
  const data = await getTheData()
  theData.value = data
})

</script>

<style scoped>
</style>

