import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from "@/constants"

export const getStoreMZpage = () => {
  const appStore = useAppStore()
  return appStore[PAGE_NAMES.MULTIZOOM]
}

export const actionMenuConfig = {
  hamburger: [
    {
      id: 'recomb-line', type: 'checkbox', label: 'Show recomb line',
      checked: {
        get: () => {
          const storeMZpage = getStoreMZpage()
          const plotID = storeMZpage.activePlotID
          return storeMZpage.plotRegistry[plotID].showRecombLine
        },
        set: (val, emit) => {
          const storeMZpage = getStoreMZpage()
          const plotID = storeMZpage.activePlotID
          storeMZpage.plotRegistry[plotID].showRecombLine = val
          emit('close-menu')
        }
      }
    },
    {
      id: 'gen-sig-line', type: 'checkbox', label: 'Show gen sig line',
      checked: {
        get: () => {
          const storeMZpage = getStoreMZpage()
          const plotID = storeMZpage.activePlotID
          return storeMZpage.plotRegistry[plotID].showGenSigLine
        },
        set: (val, emit) => {
          const storeMZpage = getStoreMZpage()
          const plotID = storeMZpage.activePlotID
          storeMZpage.plotRegistry[plotID].showGenSigLine = val
          emit('close-menu')
        }
      }
    },
    { id: 'divider', type: 'divider', },
    { id: 'export', type: 'action', label: 'Export PNG', icon: '⬇', event: 'export-plot' },
    { id: 'delete', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
  ],

    // dataTable: deletePlot, insertPlot@cell, replacePlot@cell, appendToCol@col
    datatable: [
    { id: 'copy', type: 'action', label: 'Copy Data', icon: '📋', event: 'copy-data' },
    { id: 'export', type: 'action', label: 'Export PNG', icon: '⬇', event: 'export-plot' },
    { id: 'divider-1', type: 'divider' },
    { id: 'delete', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
  ],

  // colHeader: deleteCol, moveColTo, insertColBefore, insertColAfter?
  'column-header': [
    { id: 'sort-asc', type: 'action', label: 'Sort Ascending', icon: '↑', event: 'sort-column', data: 'asc' },
    { id: 'sort-desc', type: 'action', label: 'Sort Descending', icon: '↓', event: 'sort-column', data: 'desc' },
    { id: 'divider-1', type: 'divider' },
    { id: 'hide', type: 'action', label: 'Hide Column', icon: '👁', event: 'hide-column' },
    { id: 'freeze', type: 'action', label: 'Freeze Column', icon: '📌', event: 'freeze-column' },
  ],

  // rowHeader: deleteRow, moveRowTo, insertRowBefore, insertRowAfter?
  'row-header': [
    { id: 'copy', type: 'action', label: 'Copy Row', icon: '📋', event: 'copy-data' },
    { id: 'filter', type: 'action', label: 'Filter by Row', icon: '🔍', event: 'filter-data' },
    { id: 'divider-1', type: 'divider' },
    { id: 'export', type: 'action', label: 'Export Data', icon: '⬇', event: 'export-plot' },
  ]
}

export const getMenuItems = (menuType) => {
  return actionMenuConfig[menuType] || []
}
