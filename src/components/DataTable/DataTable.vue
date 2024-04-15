 <template>
   <v-data-table-server
    :headers="visibleColumns"
    :items="dataItems"
    :items-length="countPairs"
    :items-per-page="itemsPerPage"
    :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
    :loading="isLoadingData"
    :page="currentPage"

    @click:row="onRowClick"
    @update:itemsPerPage="onItemsPerPageChanged"
    @update:page="onPageChanged"
    @update:sortBy="onSortUpdate"

    :fixed-header="false"
    :multi-sort="true"
    show-current-page
    density="compact"
    class="table-base"
    :loading-text="loadingText"
  >

    <template v-slot:item.actions="{ item }">
      <v-icon icon="mdi-image-plus-outline" @click="onAddPlotIconClick(item)" class="text-clcAction mx-n2" size="26px"/>
    </template>

    <template v-slot:item.signal1.analysis.study.uuid="{item}">
      <StudyLabel :study="item.signal1.analysis.study.uuid" abbrev/>
    </template>

    <!-- params: { analysis_id: item.signal1.analysis.uuid} -->
    <template v-slot:item.signal1.analysis.trait.uuid="{item}">
      <router-link @click.native.stop :to="{name: 'manhattan'}" class="text-decoration-none text-clcAction">
        <TraitLabel :trait="item.signal1.analysis.trait" abbrev/>
      </router-link>
    </template>

    <template v-slot:item.signal2.analysis.study.uuid="{item}">
      <StudyLabel :study="item.signal2.analysis.study.uuid" abbrev/>
    </template>

    <template v-slot:item.signal2.analysis.trait.uuid="{item}">
        <TraitLabel :trait="item.signal2.analysis.trait" abbrev />
    </template>

    <template v-slot:item.signal2.analysis.trait.biomarker_type="{item}">
        {{ item.signal2.analysis.trait.biomarker_type.replace("-expression", "") }}
    </template>

    <template v-slot:item.signal2.analysis.trait.gene.ens_id="{item}">
      <EnsgLabel :trait="item.signal2.analysis.trait" />
    </template>

    <template v-slot:item.signal2.analysis.tissue="{item}">
      {{ item.signal2.analysis.tissue }}
    </template>

    <template v-slot:item.signal1.lead_variant.vid="{item}">
      <VariantLabel :variant="item.signal1.lead_variant.vid" />
    </template>

    <template v-slot:item.signal2.lead_variant.vid="{item}">
      <VariantLabel :variant="item.signal2.lead_variant.vid" />
    </template>

    <template v-slot:item.signal1.neg_log_p="{item}">
      {{ (+item.signal1.neg_log_p).toFixed(2) }}
    </template>

    <template v-slot:item.signal2.neg_log_p="{item}">
      {{ (+item.signal2.neg_log_p).toFixed(2) }}
    </template>

    <template v-slot:item.coloc_h3="{item}">
      {{ item.coloc_h3.toFixed(2) }}
    </template>

    <template v-slot:item.coloc_h4="{item}">
      {{ item.coloc_h4.toFixed(2) }}
    </template>

    <template v-slot:item.r2="{item}">
      {{ item.r2.toFixed(2) }}
    </template>

    <template v-slot:item.n_coloc_between_traits="{item}">
      {{ item.n_coloc_between_traits }}
    </template>

    <template #item.cross_signal.effect="{item}">
      <ConcordanceLabel :item="item"/>
    </template>

    <template v-slot:item.signal1.effect_marg="{item}">
      {{ item.signal1.effect_marg.toFixed(2) }}
    </template>

    <template v-slot:item.signal2.effect_marg="{item}">
      {{ item.signal2.effect_marg.toFixed(2) }}
    </template>

    <template v-slot:item.signal1.effect_cond="{item}">
      {{ item.signal1.effect_cond.toFixed(2) }}
    </template>

    <template v-slot:item.signal2.effect_cond="{item}">
      {{ item.signal2.effect_cond.toFixed(2) }}
    </template>

    <template v-slot:item.marg_cond_flip="{item}">
      {{ +item.marg_cond_flip }}
    </template>

    <template v-slot:header.r2="{ column }">
      <R2Header :title="column.title"/>
    </template>

    <template v-slot:header.cross_signal.effect="{ column }">
      <ConcordanceHeader :title="column.title"/>
    </template>

    <template v-slot:header.n_coloc_between_traits="{ column }">
      <ColocHeader :title="column.title"/>
    </template>

    <template v-slot:footer.prepend>
      <div>
      <v-tooltip activator="parent" location="top">
        Click to download currently displayed data
      </v-tooltip>
      <v-icon icon="mdi-file-download-outline" @click="onFileDownloadClick()" class="text-clcAction mx-3" size="32px"/>
      </div>
    </template>

 </v-data-table-server>
</template>

<script setup>
// *** Imports *****************************************************************
import { inject, nextTick, ref, shallowRef, watch } from 'vue'
import { useDataTableHelpers } from '@/composables/DataTableHelpers'
import { useFilterStore } from '@/stores/FilterStore'
import { PAGE_STORE_DATA_MAP, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import { useDirectionOfEffect } from '@/composables/DirectionOfEffect'

// *** Composables ***************************************************************
const filterStore = useFilterStore()
const { fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()

// *** Props *******************************************************************

// *** Variables ***************************************************************
const countPairs = ref(0)
const currentPage = ref()
const dataItems = shallowRef([])
const isLoadingData = ref(false)
const itemsPerPage = ref()
const loadingText = ref('Loading data ...')

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
const loadTableDataFlag = inject('loadTableDataFlag')

// *** Emits *******************************************************************
const emit = defineEmits(['row-click'])

// *** Watches *****************************************************************
watch(() => filterStore.filterDataChanged, async () => {
  await loadTableData()
  scrollTop()
})

watch(() => loadTableDataFlag.value, async () => {
  await loadTableData()
  scrollTop()
})

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  console.log('dt: add plot for item:', item)
}

const onRowClick = (item) => {
  emit('row-click', item)
}

const onItemsPerPageChanged = (ipp) => {
  console.log('dt: items per page changed, updating store', ipp)
  itemsPerPage.value = ipp
  currentPage.value = 1
  filterStore.updateFilter('pageSize', ipp)
}

const onPageChanged = (newPageNum) => {
  currentPage.value = newPageNum
  filterStore.updateFilter('pageNum', newPageNum)
}

const onFileDownloadClick = () => {
  fileDownload(dataItems.value)
}

const onSortUpdate = (newSort) => {
  filterStore.updateSort(newSort)
}

// *** Utility functions *******************************************************
const scrollTop = () => {
  // in some scenarios, nextTick may not allow enough time for the table to update itself, so use the timeout if necessary
  nextTick(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) })
  // setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
}

const loadTableData = async () => {
  const { fetchData, data } = useFetchData()
  isLoadingData.value = true
  filterStore.isDirEffectReady = false

  const parentKey = PAGE_STORE_DATA_MAP[filterStore.currentPageName]
  const url = filterStore.buildSearchURL(URLS.DATA)

  if(await fetchData(url)) {
    dataItems.value = data.value.results
    filterStore.itemCount = dataItems.value.length
    countPairs.value = data.value.count
    filterStore.countPairs = data.value.count
    filterStore.dirEffect = useDirectionOfEffect(dataItems.value)
    filterStore.isDirEffectReady = true

    scrollTop()

    currentPage.value = filterStore[parentKey].filters.pageNum
    itemsPerPage.value = filterStore[parentKey].filters.pageSize
  }

  isLoadingData.value = false
}


// *** Configuration data ******************************************************

</script>

<style scoped>
.table-base {
  font-size: 1rem;
  line-height: 1.3;
}

a:hover {
  font-weight: bold;
}

</style>
