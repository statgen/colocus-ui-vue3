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
      <v-data-table :headers="visibleColumns" :items="table2Data" density="compact">
        <template v-slot:item.gwasStudy="{ item }">{{ item.gwasStudy }}</template>
        <template v-slot:item.gwasTrait="{ item }">{{ item.gwasTrait }}</template>
        <template v-slot:item.gwasType="{ item }">{{ item.gwasType }}</template>

        <template v-slot:item.qtlStudy="{ item }">{{ item.qtlStudy }}</template>
        <template v-slot:item.qtlType="{ item }">{{ item.qtlType }}</template>
<!--        <template v-slot:item.qtlGene="{ item }">{{ item.qtlGene }}</template>-->

        <template v-slot:item.qtlTrait="{ item }">
          <EnsgLabel :trait="item.qtlTrait" />
        </template>

        <template v-slot:item.qtlTissue="{ item }">{{ item.qtlTissue }}</template>


        <template v-slot:item.gwasLeadVariant="{ item }">
          <VariantLabel :variant="item.gwasLeadVariant" :showSplotch="true" />
        </template>
        <template v-slot:item.qtlLeadVariant="{ item }">
          <VariantLabel :variant="item.qtlLeadVariant" :showSplotch="true" />
        </template>

        <template v-slot:item.qtlDataset="{ item }">{{ item.qtlDataset }}</template>
        <template v-slot:item.gwasDataset="{ item }">{{ item.gwasDataset }}</template>
        <template v-slot:item.qtlSymbol="{ item }">{{ item.qtlSymbol }}</template>
        <template v-slot:item.otherGenesAnyTissueCount="{ item }">{{ item.otherGenesAnyTissueCount }}</template>
        <template v-slot:item.otherGenesAnyTissue="{ item }">{{ item.otherGenesAnyTissue }}</template>
        <template v-slot:item.otherGenesSameTissueCount="{ item }">{{ item.otherGenesSameTissueCount }}</template>
        <template v-slot:item.otherGenesSameTissue="{ item }">{{ item.otherGenesSameTissue }}</template>
      </v-data-table>
    </div>
  </v-container>
  </v-col>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useGenePageHelpers } from '@/composables/GenePageHelpers';

const { getTheData, visibleColumns } = useGenePageHelpers();

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
