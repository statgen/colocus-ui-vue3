import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { findPlotRegion } from '@/util/util'
import { PAGE_NAMES } from '@/constants'

export const useDataTableHelpers = () => {
  const appStore = useAppStore()

  const locuszoomPage = PAGE_NAMES.LOCUSZOOM
  const searchPage = PAGE_NAMES.SEARCH

  const showEnsIDs = ref(false)
  const showEffects = ref(false)

  const showAddPlotIcon = () => {
    return ['locuszoom'].includes(appStore.currentPageName)
  }

  watch(() => appStore[searchPage].showEnsIDs, newValue => {showEnsIDs.value = newValue})
  watch(() => appStore[locuszoomPage].showEnsIDs, newValue => {showEnsIDs.value = newValue})

  watch(() => appStore[searchPage].showEffects, newValue => {showEffects.value = newValue})
  watch(() => appStore[locuszoomPage].showEffects, newValue => {showEffects.value = newValue})

  const alwaysShow = () => true

  const allColumns= [
    { title: 'Add plots', value: 'actions', sortable: false, visible: () => showAddPlotIcon() },
    { title: 'Study 1', sortable: true, value: 'signal1.analysis.study.uuid', minWidth: '6rem', visible: alwaysShow },
    { title: 'Trait 1', sortable: true, value: 'signal1.analysis.trait.uuid', minWidth: '7rem', visible: alwaysShow },
    { title: 'Study 2', sortable: true, value: 'signal2.analysis.study.uuid', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 2', sortable: true, value: 'signal2.analysis.trait.uuid', minWidth: '10rem', visible: alwaysShow },
    { title: 'Trait 2 Type', sortable: false, value: 'signal2.analysis.trait.biomarker_type', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 2 ENSG', sortable: true, value: 'signal2.analysis.trait.gene.ens_id', minWidth: '12rem', visible: () => showEnsIDs.value },
    { title: 'Trait 2 Tissue', sortable: true, value: 'signal2.analysis.tissue', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 1 Variant', sortable: true, value: 'signal1.lead_variant.vid', minWidth: '12rem', visible: alwaysShow },
    { title: 'Trait 2 Variant', sortable: true, value: 'signal2.lead_variant.vid', minWidth: '12rem', visible: alwaysShow },
    { title: 'Trait 1 −log10p', sortable: true, value: 'signal1.neg_log_p', align: "end", visible: alwaysShow },
    { title: 'Trait 2 −log10p', sortable: true, value: 'signal2.neg_log_p', align: "end", visible: alwaysShow },
    { title: 'H3', sortable: true, value: 'coloc_h3', align: "end", visible: alwaysShow },
    { title: 'H4', sortable: true, value: 'coloc_h4', align: "end", visible: alwaysShow },
    { title: 'R2', sortable: true, value: 'r2', visible: alwaysShow },
    { title: 'Colocs', sortable: true, value: 'n_coloc_between_traits', width: '', align: "end", visible: alwaysShow },
    { title: 'Concord', align: 'center', sortable: false, value: 'cross_signal.effect', width: '140px', visible: alwaysShow },
    { title: 'Trait 1 Marginal Effect', sortable: false, value: 'signal1.effect_marg', align: "end", visible: () => showEffects.value },
    { title: 'Trait 2 Marginal Effect', sortable: false, value: 'signal2.effect_marg', align: "end", visible: () => showEffects.value },
    { title: 'Trait 1 Cond Effect', sortable: false, value: 'signal1.effect_cond', align: "end", visible: () => showEffects.value },
    { title: 'Trait 2 Cond Effect', sortable: false, value: 'signal2.effect_cond', align: "end", visible: () => showEffects.value },
    { title: 'Effect Flipped Marg ↔ Cond', sortable: false, value: 'marg_cond_flip', align: "end", visible: () => showEffects.value },
  ]

  const visibleColumns = computed(() => {
    return allColumns.filter(header => header.visible())
  })

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const convertToCSV = (data, headers) => {
    // Headers row
    const csvRows = [
      headers.map(header => `"${header.title}"`).join(',')
    ]

    // Data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = getNestedValue(item, header.value)
        // Handle undefined and null values, and escape double quotes by doubling them
        const formattedValue = value == null ? '' : `"${String(value).replace(/"/g, '""')}"`
        return formattedValue
      }).join(',')
      csvRows.push(row)
    })

    return csvRows.join('\n')
  }

  // use passed in headers if present, else assume this is for search etc data table and use visibleColumns
  const fileDownload = (dataItems, headers) => {
    let csvString
    if(headers) {
      csvString = convertToCSV(dataItems, headers)
    } else {
      csvString = convertToCSV(dataItems, visibleColumns.value)

    }
    const blob = new Blob([csvString], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'colocus-data-table.csv'
    document.body.appendChild(link) // Append to body to make it work in Firefox
    link.click()
    document.body.removeChild(link) // Clean up
  }

  const ITEMS_PER_PAGE_OPTIONS = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
    {value: 100, title: '100'},
    {value: 200, title: '200'},
    // {value: -1, title: '$vuetify.dataFooter.itemsPerPageAll'} // this would be for all records
  ]

  return {
    findPlotRegion,
    fileDownload,
    visibleColumns,
    ITEMS_PER_PAGE_OPTIONS,
  }
}
