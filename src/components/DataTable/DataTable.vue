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
    :page="currentPageNum"
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

    <template #[`item.expand-left`]="{ item }">
      <v-icon class="text-clcAction" @click.stop="onExpandRow(item, 'left')">
        {{ isRowExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </template>

    <template #[`item.expand-right`]="{ item }">
      <v-icon class="text-clcAction" @click.stop="onExpandRow(item, 'right')">
        {{ isRowExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </template>

    <template #expanded-row="{ columns, item }">
      <tr>
        <td :colspan=columns.length>
          <div class="d-flex mx-14 my-4" :class="expanderAlignment === 'left' ? 'justify-start' : 'justify-end'">
            <DataTableDetails :item="item" />
          </div>
        </td>
      </tr>
    </template>

    <template v-if="appStore.currentPageName===PAGE_NAMES.MULTIZOOM" #item.actions="{ item }">
      <PlotNum :row-key="item.uuid" slot="slot1" @onPlotIconClick="(args) => onPlotIconClick(args, item.uuid, item.signal1)" />
      <PlotNum :row-key="item.uuid" slot="slot2" @onPlotIconClick="(args) => onPlotIconClick(args, item.uuid, item.signal2 )" />
    </template>

    <template v-else-if="appStore.currentPageName===PAGE_NAMES.LOCUSZOOM" #item.actions="{ item }">
      <v-icon icon="mdi-image-plus-outline" @click.stop="onAddPlotIconClick(item)" class="text-clcAction" size="22px"/>
    </template>

    <!-- data columns -->
    <template #item.signal1.analysis.study.uuid="{item}"><StudyLabel :study="item.signal1?.analysis?.study?.uuid ?? ''" abbrev/></template>
    <template #item.signal1.analysis.trait.uuid="{item}"><TraitLabel :trait="item.signal1?.analysis?.trait"/></template>
    <template #item.signal1.analysis.analysis_type="{item}">
      {{ item.signal1?.analysis?.analysis_type ?? '' }}
    </template>
    <template #item.signal1.analysis.trait.gene.ens_id="{item}"><EnsgLabel :trait="item.signal1?.analysis?.trait ?? ''" /></template>
    <template #item.signal1.analysis.tissue="{item}">{{ item.signal1?.analysis?.tissue ?? '' }}</template>
    <template #item.signal2.analysis.study.uuid="{item}"><StudyLabel :study="item.signal2?.analysis?.study?.uuid ?? ''" abbrev/></template>
    <template #item.signal2.analysis.trait.uuid="{item}"><TraitLabel :trait="item.signal2?.analysis?.trait"/></template>
    <template #item.signal2.analysis.analysis_type="{item}">
      {{ item.signal2?.analysis?.analysis_type ?? '' }}
    </template>
    <template #item.signal2.analysis.trait.gene.ens_id="{item}"><EnsgLabel :trait="item.signal2?.analysis?.trait ?? ''" /></template>
    <template #item.signal2.analysis.tissue="{item}">{{ item.signal2?.analysis?.tissue ?? '' }}</template>
    <template #item.signal1.lead_variant.vid="{item}"><VariantLabel :variant="item.signal1?.lead_variant?.vid ?? ''" :showSplotch="true" /></template>
    <template #item.signal2.lead_variant.vid="{item}"><VariantLabel :variant="item.signal2?.lead_variant?.vid ?? ''" :showSplotch="true" /></template>
    <template #item.signal1.neg_log_p="{item}">{{ safeToFixed(item.signal1?.neg_log_p, 2) }}</template>
    <template #item.signal2.neg_log_p="{item}">{{ safeToFixed(item.signal2?.neg_log_p, 2) }}</template>
    <template #item.coloc_h3="{item}">{{ safeToFixed(item.coloc_h3, 2) }}</template>
    <template #item.coloc_h4="{item}">{{ safeToFixed(item.coloc_h4, 2) }}</template>
    <template #item.r2="{item}">{{ safeToFixed(item.r2, 2) }}</template>
    <template #item.n_coloc_between_traits="{item}">{{ item.n_coloc_between_traits }}</template>
    <template #item.cross_signal.effect="{item}"><ConcordanceLabel :item="item"/></template>
    <template #item.signal1.effect_marg="{item}">{{ safeToFixed(item.signal1.effect_marg, 2) }}</template>
    <template #item.signal2.effect_marg="{item}">{{ safeToFixed(item.signal2.effect_marg, 2) }}</template>
    <template #item.signal1.effect_cond="{item}">{{ safeToFixed(item.signal1.effect_cond, 2) }}</template>
    <template #item.signal2.effect_cond="{item}">{{ safeToFixed(item.signal2.effect_cond, 2) }}</template>
    <template #item.marg_cond_flip="{item}">{{ +item.marg_cond_flip }}</template>

    <template #footer.prepend>
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
import { computed, inject, onMounted, ref, shallowRef, watch } from 'vue'
import { useDataTableHelpers } from '@/composables/DataTableHelpers'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES, URLS } from '@/constants'
import { scrollTop } from '@/util/util'
import { useFetchData } from '@/composables/fetchData'
import { useDirectionOfEffect } from '@/composables/DirectionOfEffect'
import router from '@/router'
import PlotNum from "@/components/misc widgets/PlotNum.vue";
import { useMZGridHelpers } from '@/composables/mzGridHelpers'

// *** Composables ***************************************************************
const appStore = useAppStore()
const { fileDownload, ITEMS_PER_PAGE_OPTIONS, visibleColumns } = useDataTableHelpers()
const mzGridHelpers = useMZGridHelpers()

// *** Props *******************************************************************
const props = defineProps(['id'])

// *** Variables ***************************************************************
const expanderAlignment = ref('left')
const currentPageName = ref('')
const currentPageNum = ref()
const dataItems = shallowRef([])
let debounceTimer = null
const isLoadingData = ref(false)
const itemsPerPage = ref()
const loadingText = ref('Loading data ...')
const locuszoomPage = PAGE_NAMES.LOCUSZOOM
const multizoomPage = PAGE_NAMES.MULTIZOOM
const searchPage = PAGE_NAMES.SEARCH

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
const loadTableDataFlag = inject('loadTableDataFlag')

// *** Emits *******************************************************************
const emit = defineEmits(['onDataTableRowClick', 'onAddPlotIconClick', 'on-plot-icon-click'])

// *** Watches *****************************************************************
watch(() => appStore.filterPanelControls.filterDataChanged, async () => {
  appStore[currentPageName.value].lzfilterDataChanged = true;
  await loadDataDebounced()
})

watch(() => appStore[currentPageName.value]?.showOrphans, async () => {
  let showOrphans = appStore[currentPageName.value].showOrphans
  if (showOrphans) {
    appStore[currentPageName.value].filters.h4 = 0
    appStore[currentPageName.value].filters.r2 = 0

    appStore[locuszoomPage].filters.h4 = 0
    appStore[locuszoomPage].filters.r2 = 0

    appStore[multizoomPage].filters.h4 = 0
    appStore[multizoomPage].filters.r2 = 0

    appStore[searchPage].filters.h4 = 0
    appStore[searchPage].filters.r2 = 0
  }
  await loadDataDebounced()
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
onMounted(async () => {
  currentPageName.value = appStore.currentPageName
})

// *** Event handlers **********************************************************
const onAddPlotIconClick = (item) => {
  emit('onAddPlotIconClick', item)
}

const onExpandRow = (item, side) => {
  const colocID = item.uuid
  // console.log(`ColocID: ${colocID} Variant1: ${item.signal1.lead_variant.vid} ID: ${item.signal1.uuid} Variant2: ${item.signal2.lead_variant.vid} ID: ${item.signal2.uuid}`)
  appStore.colocID = colocID
  expanderAlignment.value = side
  if (appStore.dataTable.expandedRow.indexOf(colocID) === -1) {
    appStore.dataTable.expandedRow.splice(0, appStore.dataTable.expandedRow.length, colocID)
  } else {
    appStore.dataTable.expandedRow.splice(0, appStore.dataTable.expandedRow.length)
  }
}

const onFileDownloadClick = () => {
  fileDownload(dataItems.value)
}

const onItemsPerPageChanged = async (ipp) => {
  await appStore.updateFilter('pageSize', ipp)
  itemsPerPage.value = ipp
  currentPageNum.value = 1
}

const onKeyDownEscape = () => {
  clearExpandedRow()
}

const onPageChanged = async (newPageNum) => {
  await appStore.updateFilter('pageNum', newPageNum)
  currentPageNum.value = newPageNum
}

const onRowClick = async (event, item) => {
  const colocID = item.item.uuid
  appStore.colocID = colocID
  emit('onDataTableRowClick', item)
}

const onSortUpdate = (newSort) => {
  appStore.updateSort(newSort)
}

const onPlotIconClick = async (args, colocID, signal) => {
  const args1 = {...args, colocID, signal}
  emit('on-plot-icon-click', args1)
}

// *** Utility functions *******************************************************
const clearExpandedRow = () => appStore.dataTable.expandedRow.length = 0

const safeToFixed = (val, digits) => {
  val = parseFloat(val)
  if (val == null || Number.isNaN(val)) return ''
  return (val).toFixed(digits)
}

// this works by scheduling a timeout for *after* the current event loop tick
const loadDataDebounced = async () => {
  clearTimeout(debounceTimer) // cancel pending call, if any
  debounceTimer = setTimeout(() => {
    loadData()
  }, 0)
}

const isRowExpanded = item => appStore.dataTable.expandedRow.includes(item.uuid)

const loadColocData = async (cpn, url) => {
  const { data, errorMessage, fetchData } = useFetchData()

  if(await fetchData(url, 'coloc plot data', cpn)) {
    appStore[cpn].colocData = data.value
    appStore[cpn].colocDataReady = true
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
    currentPageNum.value = appStore[parentKey].filters.pageNum
    itemsPerPage.value = appStore[parentKey].filters.pageSize

  } else {
    throw new Error('Error loading table data:\n' + errorMessage)
  }
}

const loadData = async () => {
  const cpn = currentPageName.value
  const colocID = appStore.colocID
  if([locuszoomPage, multizoomPage].includes(cpn) && !colocID) {
    await router.push({ name: searchPage })
    return
  }
  let url = null
  isLoadingData.value = true

  try {
    if ([locuszoomPage, multizoomPage].includes(cpn)) {
      if(!appStore[cpn].colocDataReady) {
        let colocURL = `${URLS.COLOC_DATA}/${colocID}`
        if (appStore[cpn].showOrphans) {
          colocURL += `?include_orphans=1`
        }
        await loadColocData(cpn, colocURL)
      }
      const signal1 = appStore[cpn].colocData.signal1
      const signal2 = appStore[cpn].colocData.signal2
      url = appStore.buildLZdataTableURL(URLS.COLOC_DATA, signal1, signal2)

      if(!appStore[cpn].tableDataLoaded || appStore[cpn].lzfilterDataChanged) {
        await loadTableData(cpn, url)
        appStore[cpn].tableDataLoaded = true
        appStore[cpn].lzfilterDataChanged = false
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
  const cpn = currentPageName.value
  if(![locuszoomPage, multizoomPage].includes(cpn)) return
  if(!appStore[cpn].colocDataReady) return

  const s1 = appStore[cpn].colocData.signal1
  const s2 = appStore[cpn].colocData.signal2

  if((s1?.uuid === item.signal1?.uuid) && (s2?.uuid === item.signal2?.uuid)) {
    return { class: 'bg-clcTableHighlight font-weight-bold' }
  } else {
    return {}
  }
}

// *** Configuration data ******************************************************
</script>

<style scoped>
.table-base {
  font-size: 1rem;
  line-height: 1.3;
}

.icon-placeholder {
  width: 18px;
  height: 18px;
  display: inline-block;
  margin-right: 4px;
  /*border: 2px solid black;*/
}
</style>
