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
          const plotID = storeMZpage.activePlotID.toString()
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
    { id: 'delete', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
    { id: 'export', type: 'action', label: 'Export PNG', icon: '⬇', event: 'export-plot' },
    { id: 'move-plot-insert', type: 'input', label: 'Move plot (insert)', icon: '➤', event: 'move-plot-insert' },
    { id: 'move-plot-replace', type: 'input', label: 'Move plot (replace)', icon: '➤', event: 'move-plot-replace' },
  ],

    datatable: [
    { id: 'delete-plot', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
    { id: 'add-plot-insert', type: 'input', label: 'Add plot (insert)', icon: '➕', event: 'add-plot-insert' },
    { id: 'add-plot-replace', type: 'input', label: 'Add plot (replace)', icon: '➕', event: 'add-plot-replace' },
    { id: 'move-plot-insert', type: 'input', label: 'Move plot (insert)', icon: '➤', event: 'move-plot-insert' },
    { id: 'move-plot-replace', type: 'input', label: 'Move plot (replace)', icon: '➤', event: 'move-plot-replace' },
  ],

  'mock-cell': [
    { id: 'delete-cell', type: 'action', label: 'Delete cell, move up', icon: '🗑', event: 'delete-cell' },
  ],

  // colHeader: deleteCol, moveColTo, insertColBefore, insertColAfter?
  'column-header': [
    { id: 'add-column', type: 'action', label: 'Add column', icon: '➕', event: 'add-column' },
    { id: 'delete-column', type: 'action', label: 'Delete column', icon: '➕', event: 'delete-column' },
    { id: 'move-column', type: 'input', label: 'Move column', icon: '➕', event: 'move-column' },
  ],

  // rowHeader: deleteRow, moveRowTo, insertRowBefore, insertRowAfter?
  'row-header': [
    { id: 'add-row', type: 'action', label: 'Add row', icon: '➕', event: 'add-row' },
    { id: 'delete-row', type: 'action', label: 'Delete row', icon: '➕', event: 'delete-row' },
    { id: 'move-row', type: 'input', label: 'Move row', icon: '➕', event: 'move-row' },
  ]
}

export const getMenuItems = (menuType) => {
  return actionMenuConfig[menuType]
}
