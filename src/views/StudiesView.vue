<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])
const headers = ref([
  { title: 'Dataset', value: 'study', sortable: true},
  { title: 'Authors', value: 'authors', sortable: true },
  { title: 'Submitter', value: 'submitter', sortable: true},
  { title: 'Study Type', value: 'study_type', sortable: true },
  { title: 'Number of Traits', value: 'ntraits', sortable: true },
  { title: 'Trait(s)', value: 'trait', sortable: true },
  { title: 'Tissue', value: 'tissue', sortable: true },
  { title: 'Build', value: 'build', sortable: true },
  { title: 'PubMed ID', value: 'pmid', sortable: true },
  { title: 'External Link', value: 'link', sortable: true }
])
const itemsPerPage = ref(25);
const search = ref('')

onMounted(async () => {
  const response = await fetch('/data/studies.json')
  data.value = await response.json()
})
</script>

<template>
  <v-row>
    <v-col>
      <h1 class="mt-4">Studies</h1>
      <v-row>
        <v-col cols="5">
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            single-line
            clearable
            density="comfortable"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-data-table
        :items="data"
        :headers="headers"
        :search="search"
        :fixed-header="false"
        :items-per-page="itemsPerPage"
        :multi-sort="true"
        class="table-base mt-4"
        density="compact"
        show-current-page
      >
        <template v-slot:item.trait="{ value }">
          <!-- Split the comma-separated list of traits into an array and join them with a comma and space -->
          <!-- This allows v-data-table to split the list and wrap -->
          {{ value.split(',').join(', ') }}
        </template>

        <template v-slot:item.link="{ value }">
          <a class="text-clcAction" :href="value" target="_blank">{{ value }}</a>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<style scoped>
.table-base {
  font-size: 1rem;
  line-height: 1.3;
}
</style>
