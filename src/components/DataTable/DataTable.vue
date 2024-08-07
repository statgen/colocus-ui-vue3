 <template>
  <v-data-table-server
    :fixed-header="false"
    :headers="visibleColumns"
    :row-props="({item}) => getRowClass(item)"
    :items="dataItems"
    :items-length="appStore.dataTable.countPairs"
    :items-per-page="itemsPerPage"
    :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
    :loading="isLoadingData"
    :loading-text="loadingText"
    :multi-sort="true"
    :page="currentPage"

    @click:row="onRowClick"
    @update:itemsPerPage="onItemsPerPageChanged"
    @update:page="onPageChanged"
    @update:sortBy="onSortUpdate"

    class="table-base"
    density="compact"
    show-current-page
  >
    <template v-slot:item.actions="{ item }">
      <v-icon icon="mdi-image-plus-outline" @click.stop="onAddPlotIconClick(item)" class="text-clcAction" size="22px"/>
    </template>

    <template v-slot:item.signal1.analysis.study.uuid="{item}">
      <StudyLabel :study="item.signal1.analysis.study.uuid" abbrev/>
    </template>

    <template v-slot:item.signal1.analysis.trait.uuid="{item}">
      <div @click.stop="onTrait1Click(item)" class="mhclick">
        <TraitLabel :trait="item.signal1.analysis.trait" abbrev/>
      </div>

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
      <VariantLabel :variant="item.signal1.lead_variant.vid" :showSplotch="true" />
    </template>

    <template v-slot:item.signal2.lead_variant.vid="{item}">
      <VariantLabel :variant="item.signal2.lead_variant.vid" :showSplotch="true" />
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
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import { useDirectionOfEffect } from '@/composables/DirectionOfEffect'
import router from '@/router'

// *** Composables ***************************************************************
const appStore = useAppStore()
const { buildLZTableURL, fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()

// *** Props *******************************************************************

// *** Variables ***************************************************************
const currentPage = ref()
const dataItems = shallowRef([])
const isLoadingData = ref(false)
const itemsPerPage = ref()
const loadingText = ref('Loading data ...')
const manhattanPage = PAGE_NAMES.MANHATTAN

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
const loadTableDataFlag = inject('loadTableDataFlag')

// *** Emits *******************************************************************
const emit = defineEmits(['onDataTableRowClick', 'onAddPlotIconClick', 'onTrait1Click'])

// *** Watches *****************************************************************
watch(() => appStore.filterControls.filterDataChanged, async () => {
  await loadData()
})

watch(() => loadTableDataFlag.value, async () => {
  await loadData()
})

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  emit('onAddPlotIconClick', item)
}

const onFileDownloadClick = () => {
  fileDownload(dataItems.value)
}

const onItemsPerPageChanged = (ipp) => {
  appStore.updateFilter('pageSize', ipp)
  itemsPerPage.value = ipp
  currentPage.value = 1
}

const onPageChanged = (newPageNum) => {
  appStore.updateFilter('pageNum', newPageNum)
  currentPage.value = newPageNum
}

const onRowClick = async (event, item) => {
  appStore[PAGE_NAMES.LOCUSZOOM].colocID = item.item.uuid
  await router.push({name: PAGE_NAMES.LOCUSZOOM, params: {}})
}

const onSortUpdate = (newSort) => {
  appStore.updateSort(newSort)
}

const onTrait1Click = (item) => {
  const analysisID = item.signal1.analysis.uuid
  appStore.setPageKey(manhattanPage, 'analysisID', analysisID)
  const cpn = appStore.currentPageName
  if(cpn === manhattanPage) {
    emit('onTrait1Click')
  } else {
    router.push({name: manhattanPage})
  }
}

// *** Utility functions *******************************************************
const loadColocData = async (cpn, url) => {
  const { data, errorMessage, fetchData } = useFetchData()

  if(await fetchData(url, 'coloc plot data', cpn)) {
    appStore[PAGE_NAMES.LOCUSZOOM].colocData = data.value
    appStore[PAGE_NAMES.LOCUSZOOM].colocDataReady = true
  } else {
    throw new Error('Error loading coloc plot data:\n' + errorMessage)
  }
}

const loadTableData = async (cpn, url) => {
  const { data, errorMessage, fetchData } = useFetchData()
  appStore.dataTable.isDirEffectReady = false
  if(await fetchData(url, 'table data', cpn)) {
    dataItems.value = data.value.results
    appStore.dataTable.itemCount = dataItems.value.length
    appStore.dataTable.countPairs = data.value.count

    appStore.dataTable.dirEffect = useDirectionOfEffect(dataItems.value)
    appStore.dataTable.isDirEffectReady = true

    const parentKey = cpn
    currentPage.value = appStore[parentKey].filters.pageNum
    itemsPerPage.value = appStore[parentKey].filters.pageSize

  } else {
    throw new Error('Error loading table data:\n' + errorMessage)
  }
}

const loadData = async () => {
  const colocID = appStore[PAGE_NAMES.LOCUSZOOM].colocID
  const cpn = appStore.currentPageName
  if(cpn === PAGE_NAMES.LOCUSZOOM && !colocID) {
    await router.push({ name: PAGE_NAMES.SEARCH })
    return
  }
  let url = null
  isLoadingData.value = true

  try {
    if (cpn === PAGE_NAMES.LOCUSZOOM) {
      const colocURL = `${URLS[cpn]}${colocID}`
      await loadColocData(cpn, colocURL)
      const signal1 = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal1
      const signal2 = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal2
      url = buildLZTableURL(URLS[cpn], signal1, signal2)

      if(!appStore[PAGE_NAMES.LOCUSZOOM].tableDataLoaded) {
        await loadTableData(cpn, url)
        appStore[PAGE_NAMES.LOCUSZOOM].tableDataLoaded = true
      }
    } else { // must be search page or manhattan page
      url = appStore.buildSearchURL(URLS[cpn])
      await loadTableData(cpn, url)
    }
  } catch (e) {
    console.error(`Error loading data:\n${e}`)
  } finally {
    isLoadingData.value = false
    scrollTop()
  }
}

const getRowClass = (item) => {
  if(appStore.currentPageName !== PAGE_NAMES.LOCUSZOOM) return
  if(!appStore[PAGE_NAMES.LOCUSZOOM].colocDataReady) return

  const s1 = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal1
  const s2 = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal2

  if((s1.uuid === item.signal1.uuid) && (s2.uuid === item.signal2.uuid)) {
    return { class: 'bg-clcTableHighlight font-weight-bold' }
  } else {
    return {}
  }
}

const scrollTop = () => {
  if(appStore.currentPageName === PAGE_NAMES.SEARCH) {
    nextTick(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) })
  }
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

.signal-row {
  font-weight: bold;
  background: aliceblue;
}

.mhclick {
  border-bottom: 1px rgba(var(--v-theme-clcAction), 1.0) dashed;
}
</style>
