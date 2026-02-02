<template>
  <DefaultLayout>
    <h1 class="mt-4">Studies</h1>

    <v-text-field
      v-model="studySearch"
      label="Search all fields"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      single-line
      clearable
      density="comfortable"
      width="300"
      class="mt-4"
    ></v-text-field>

    <v-data-table
      :items="studyDataItems"
      :headers="studyHeaders"
      :search="studySearch"
      :fixed-header="false"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      :items-per-page=10
      :multi-sort="true"
      class="table-base mt-4 ml-n2"
      density="compact"
      show-current-page
    >
      <template v-slot:item.trait="{ value }">{{ value?.split(',')?.join(', ') }}</template>
      <template v-slot:item.n_traits="{ value }">{{ value?.toLocaleString() }}</template>
      <template v-slot:item.link="{ value }"><a class="coLink" :href="value" target="_blank">{{ value }}</a></template>
      <template #item.publication.pmid="{ item }">
        <a v-if="item.publication?.pmid" class="coLink" :href="'https://pubmed.ncbi.nlm.nih.gov/' + item.publication.pmid" target="_blank">{{ item.publication.pmid }}</a>
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

    <h1 class="mt-4">Data Submissions</h1>
    <v-text-field
      v-model="submissionSearch"
      label="Search all fields"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      single-line
      clearable
      density="comfortable"
      width="300"
      class="mt-4"
    ></v-text-field>

    <v-data-table
      :items="submissionDataItems"
      :headers="submissionHeaders"
      :search="submissionSearch"
      :fixed-header="false"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      :items-per-page=10
      :multi-sort="true"
      class="table-base mt-4 ml-n2"
      density="compact"
      show-current-page
    >
      <template v-slot:item.data_hash="{ value }">{{ value?.slice(0, 11) }}</template>
    </v-data-table>
  </DefaultLayout>
</template>

<script setup>
import { ref, toRaw, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useDataTableHelpers } from '@/composables/DataTableHelpers'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'

const { fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()
const { data: studyData, errorMessage: studyErrorMessage, fetchData: fetchStudyData } = useFetchData()
const { data: submissionData, errorMessage: submissionErrorMessage, fetchData: fetchSubmissionData } = useFetchData()
const appStore = useAppStore()

const studyDataItems = ref([])
const studyHeaders = ref([
  { title: 'Dataset', value: 'uuid', sortable: true},
  { title: 'Authors', value: 'authors', sortable: true },
  { title: 'PIs', value: 'pis', sortable: true, maxWidth: '10rem' },
  { title: 'Submitter', value: 'submitter.name', sortable: true},
  { title: 'Study Type', value: 'analysis_type', sortable: true },
  { title: '# of OMIC Elements or Traits', value: 'n_traits', sortable: true },
  { title: 'Trait(s)', value: 'trait', sortable: true, maxWidth: '20rem' },
  { title: 'Tissue', value: 'tissue', sortable: true },
  { title: 'Cell Type', value: 'cell_type', sortable: true },
  { title: 'Build', value: 'genome_build', sortable: true },
  { title: 'Ancestry', value: 'ancestry', sortable: true },
  { title: 'Publication', value: 'publication.title', sortable: true, maxWidth: '20rem' },
  { title: 'PubMed ID', value: 'publication.pmid', sortable: true },
  { title: 'External Link', value: 'external_link', sortable: true }
])

const submissionDataItems = ref([])
const submissionHeaders = ref([
  { title: 'Submission', value: 'uuid', sortable: true},
  { title: 'Description', value: 'description', sortable: true },
  { title: 'Ingest Date', value: 'ingest_date', sortable: true },
  { title: 'Data Version', value: 'data_version', sortable: true},
  { title: 'Data Hash', value: 'data_hash', sortable: true },
])

const studySearch = ref('')
const submissionSearch = ref('')

onMounted(async () => {
  if(await fetchStudyData(URLS.STUDY_DATA, 'study data', appStore.currentPageName)) {
    const apiData = toRaw(studyData.value.results)
    for (let row of apiData) {
      if (row.analysis_type == 'eQTL') {
        row.trait = `${row.n_traits.toLocaleString()} genes`;
      }
      else {
        row.trait = `${row.analysis.trait.uuid}`;
      }

      row.authors = row.analysts.map(a => a.name).join(' & ');
      row.pis = row.principal_investigators.map(p => p.name).join(' & ');
    }
    studyDataItems.value = studyData.value.results
  } else {
    console.error('Error loading study data:', studyErrorMessage)
  }

  if(await fetchSubmissionData(URLS.RELEASE_DATA, 'submission data', appStore.currentPageName)) {    
    submissionDataItems.value = submissionData.value.results
  } else {
    console.error('Error loading submissions data:', submissionErrorMessage)
  }
})

const onFileDownloadClick = () => {
  fileDownload(studyDataItems.value, studyHeaders.value)
}
</script>

<style scoped>
.table-base {
  font-size: 1rem;
  line-height: 1.3;
}
</style>
