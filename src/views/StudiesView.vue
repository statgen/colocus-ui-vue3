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

      <v-row class="mb-4">
        <v-data-table
          :items="dataItems"
          :headers="headers"
          :search="search"
          :fixed-header="false"
          :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
          :items-per-page=10
          :multi-sort="true"
          class="table-base mt-4"
          density="compact"
          show-current-page
        >
          <template v-slot:item.trait="{ value }">
            {{ value.split(',').join(', ') }} <!-- allow table to wrap column elements -->
          </template>

          <template v-slot:item.link="{ value }">
            <a class="coLink" :href="value" target="_blank">{{ value }}</a>
          </template>

          <template v-slot:item.pmid="{ value }">
            <a class="coLink" :href="'https://pubmed.ncbi.nlm.nih.gov/' + value" target="_blank">{{ value }}</a>
          </template>

          <template v-slot:footer.prepend>
            <div>
              <ToolTippy>
                <v-icon icon="mdi-file-download-outline" @click="onFileDownloadClick()" class="text-clcAction mx-3" size="32px"/>
                <template #tooltipContent>
                  Click to download currently displayed data
                </template>
              </ToolTippy>
            </div>
          </template>

        </v-data-table>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataTableHelpers } from '@/composables/DataTableHelpers'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'

const { fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()
const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

const dataItems = ref([])
const headers = ref([
  { title: 'Dataset', value: 'study', sortable: true},
  { title: 'Authors', value: 'authors', sortable: true },
  { title: 'Submitter', value: 'submitter', sortable: true},
  { title: 'Study Type', value: 'study_type', sortable: true },
  { title: '# of OMIC Elements or Traits', value: 'ntraits', sortable: true },
  { title: 'Trait(s)', value: 'trait', sortable: true, maxWidth: '20rem' },
  { title: 'Tissue', value: 'tissue', sortable: true },
  { title: 'Build', value: 'build', sortable: true },
  { title: 'PubMed ID', value: 'pmid', sortable: true },
  { title: 'External Link', value: 'link', sortable: true }
])

const itemsPerPage = ref(10);
const search = ref('')

onMounted(async () => {
  // const response = await fetch('/data/studies.json')
  // data.value = await response.json()
  const url = '/data/studies.json'
  if(await fetchData(URLS.STUDY_DATA, 'study data', appStore.currentPageName)) {
    dataItems.value = data.value
  } else {
    console.error('Error loading study data:', errorMessage)
  }
  })

const onFileDownloadClick = () => {
  fileDownload(dataItems.value, headers.value)
}
</script>

<style scoped>
.table-base {
  font-size: 1rem;
  line-height: 1.3;
}
</style>
