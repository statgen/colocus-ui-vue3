 <template>
  <v-data-table-server
    :fixed-header="false"
    :headers="visibleColumns"
    :id="props.id"
    :items="dataItems"
    :items-length="appStore.dataTable.countPairs"
    :items-per-page="itemsPerPage"
    :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
    item-value="uuid"
    :loading="isLoadingData"
    :loading-text="loadingText"
    :multi-sort="true"
    :page="currentPage"
    :row-props="({item}) => getRowClass(item)"
    v-model:expanded="appStore.dataTable.expandedRow"

    @click:row="onRowClick"
    @keydown.escape="onKeyDownEscape"
    @update:itemsPerPage="onItemsPerPageChanged"
    @update:page="onPageChanged"
    @update:sortBy="onSortUpdate"

    class="table-base"
    density="compact"
    show-current-page
  >

    <template v-slot:[`item.expand-left`]="{ item }">
      <v-icon class="text-clcAction" @click.stop="onExpandRow(item, 'left')">
        {{ isRowExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </template>

    <template v-slot:[`item.expand-right`]="{ item }">
      <v-icon class="text-clcAction" @click.stop="onExpandRow(item, 'right')">
        {{ isRowExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan=columns.length>
          <div class="d-flex mx-14 my-4" :class="expanderAlignment === 'left' ? 'justify-start' : 'justify-end'">
            <DataTableDetails :item="item" />
          </div>
        </td>
      </tr>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon icon="mdi-image-plus-outline" @click.stop="onAddPlotIconClick(item)" class="text-clcAction" size="22px"/>
    </template>

    <template v-slot:item.signal1.analysis.study.uuid="{item}">
      <StudyLabel :study="item.signal1.analysis.study.uuid" abbrev/>
    </template>

    <template v-slot:item.signal1.analysis.trait.uuid="{item}">
      <TraitLabel :trait="item.signal1.analysis.trait" :key="item.signal1.analysis.trait"/>
    </template>

    <template v-slot:item.signal1.analysis.analysis_type="{item}">
      {{ item.signal1.analysis.analysis_type }}
    </template>

    <template v-slot:item.signal2.analysis.study.uuid="{item}">
      <StudyLabel :study="item.signal2.analysis.study.uuid" abbrev/>
    </template>

    <template v-slot:item.signal2.analysis.trait.uuid="{item}">
      <TraitLabel :trait="item.signal2.analysis.trait" :key="item.signal2.analysis.trait"/>
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

    <template v-slot:item.signal2.analysis.cell_type="{item}">
      {{ item.signal2.analysis.cell_type }}
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
        <ToolTippy>
          <v-icon icon="mdi-file-download-outline" @click="onFileDownloadClick()" class="text-clcAction mx-3" size="32px"/>
          <template #tooltipContent>
            Click to download currently displayed data
          </template>
        </ToolTippy>
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
const { fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()

// *** Props *******************************************************************
const props = defineProps(['id'])

// *** Variables ***************************************************************
const expanderAlignment = ref('left')
const currentPage = ref()
const dataItems = shallowRef([])
const isLoadingData = ref(false)
const itemsPerPage = ref()
const loadingText = ref('Loading data ...')
const manhattanPage = PAGE_NAMES.MANHATTAN
const locuszoomPage = PAGE_NAMES.LOCUSZOOM
const searchPage = PAGE_NAMES.SEARCH

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
const loadTableDataFlag = inject('loadTableDataFlag')

// *** Emits *******************************************************************
const emit = defineEmits(['onDataTableRowClick', 'onAddPlotIconClick'])

// *** Watches *****************************************************************
watch(() => appStore.filterPanelControls.filterDataChanged, async () => {
  appStore[locuszoomPage].filterDataChanged = true;
  await loadData()
})

watch(() => loadTableDataFlag.value, async () => {
  await loadData()
})

watch(() => appStore.tutorialFlag, async () => {
  appStore.isSidebarShowing = true
  clearExpandedRow()
  const colocID = dataItems.value[0].uuid
  appStore.dataTable.expandedRow.push(colocID)
})

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  emit('onAddPlotIconClick', item)
}

const onExpandRow = (item, side) => {
  const colocID = item.uuid
  appStore[locuszoomPage].colocID = colocID
  expanderAlignment.value = side
  if(appStore.dataTable.expandedRow.indexOf(colocID) === -1) appStore.dataTable.expandedRow = [colocID]
  else appStore.dataTable.expandedRow.length = 0
}

const onFileDownloadClick = () => {
  fileDownload(dataItems.value)
}

const onItemsPerPageChanged = (ipp) => {
  appStore.updateFilter('pageSize', ipp)
  itemsPerPage.value = ipp
  currentPage.value = 1
}

const onKeyDownEscape = () => {
  clearExpandedRow()
}

const onPageChanged = (newPageNum) => {
  appStore.updateFilter('pageNum', newPageNum)
  currentPage.value = newPageNum
}

const onRowClick = async (event, item) => {
  const colocID = item.item.uuid
  appStore[locuszoomPage].colocID = colocID
  emit('onDataTableRowClick', item)
}

const onSortUpdate = (newSort) => {
  appStore.updateSort(newSort)
}

// *** Utility functions *******************************************************
const clearExpandedRow = () => appStore.dataTable.expandedRow.length = 0

const isRowExpanded = item => appStore.dataTable.expandedRow.includes(item.uuid)

const loadColocData = async (cpn, url) => {
  const { data, errorMessage, fetchData } = useFetchData()

  if(await fetchData(url, 'coloc plot data', cpn)) {
    appStore[locuszoomPage].colocData = data.value
    appStore[locuszoomPage].colocDataReady = true
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
  const colocID = appStore[locuszoomPage].colocID
  const cpn = appStore.currentPageName
  if(cpn === locuszoomPage && !colocID) {
    await router.push({ name: searchPage })
    return
  }
  let url = null
  isLoadingData.value = true

  try {
    if (cpn === locuszoomPage) {
      if(!appStore[locuszoomPage].colocDataReady) {
        const colocURL = `${URLS.COLOC_DATA}/${colocID}`
        await loadColocData(cpn, colocURL)
      }
      const signal1 = appStore[locuszoomPage].colocData.signal1
      const signal2 = appStore[locuszoomPage].colocData.signal2
      url = appStore.buildLZdataTableURL(URLS.COLOC_DATA, signal1, signal2)

      if(!appStore[locuszoomPage].tableDataLoaded || appStore[locuszoomPage].filterDataChanged) {
        await loadTableData(cpn, url)
        appStore[locuszoomPage].tableDataLoaded = true
        appStore[locuszoomPage].filterDataChanged = false
      }
    } else { // must be search page or manhattan page
      url = appStore.buildSearchURL(URLS.COLOC_DATA)
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
  if(appStore.currentPageName !== locuszoomPage) return
  if(!appStore[locuszoomPage].colocDataReady) return

  const s1 = appStore[locuszoomPage].colocData.signal1
  const s2 = appStore[locuszoomPage].colocData.signal2

  if((s1.uuid === item.signal1.uuid) && (s2.uuid === item.signal2.uuid)) {
    return { class: 'bg-clcTableHighlight font-weight-bold' }
  } else {
    return {}
  }
}

const scrollTop = () => {
  if(appStore.currentPageName === searchPage) {
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
</style>
