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
    { id: 'divider1', type: 'divider', },
    { id: 'insert-mock-cell', type: 'action', label: 'Insert empty cell before', icon: '➕', event: 'insert-mock-cell' },
    { id: 'divider2', type: 'divider', },
    { id: 'move-plot-insert', type: 'input', label: 'Move plot (insert) to', icon: '➤', event: 'move-plot-insert' },
    { id: 'move-plot-replace', type: 'input', label: 'Move plot (replace) to', icon: '➤', event: 'move-plot-replace' },
    { id: 'divider3', type: 'divider', },
    { id: 'export', type: 'action', label: 'Export PNG', icon: '⬇', event: 'export-plot' },
    { id: 'delete', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
  ],

    datatable: [
    { id: 'add-plot-insert', type: 'input', label: 'Add plot (insert) to', icon: '➕', event: 'add-plot-insert' },
    { id: 'add-plot-replace', type: 'input', label: 'Add plot (replace) to', icon: '➕', event: 'add-plot-replace' },
    { id: 'divider1', type: 'divider', },
    { id: 'move-plot-insert', type: 'input', label: 'Move plot (insert) to', icon: '➤', event: 'move-plot-insert' },
    { id: 'move-plot-replace', type: 'input', label: 'Move plot (replace) to', icon: '➤', event: 'move-plot-replace' },
    { id: 'divider2', type: 'divider', },
    { id: 'delete-plot', type: 'action', label: 'Delete Plot', icon: '🗑', event: 'delete-plot' },
  ],

  'mock-cell': [
    { id: 'add-gene-panel', type: 'action', label: 'Add gene panel', icon: '➕', event: 'add-gene-panel' },
    { id: 'divider', type: 'divider', },
    { id: 'insert-mock-cell', type: 'action', label: 'Insert empty cell before', icon: '➕', event: 'insert-mock-cell' },
    { id: 'divider', type: 'divider', },
    { id: 'delete-cell', type: 'action', label: 'Delete cell, move lower cells up', icon: '🗑', event: 'delete-cell' },
  ],

  'column-header': [
    { id: 'append-column', type: 'action', label: 'Append column to end', icon: '➕', event: 'append-column' },
    { id: 'insert-column', type: 'action', label: 'Insert column before', icon: '➕', event: 'insert-column' },
    { id: 'divider1', type: 'divider', },
    { id: 'move-column-insert', type: 'input', label: 'Move column (insert) to', icon: '➤', event: 'move-column-insert' },
    { id: 'move-column-replace', type: 'input', label: 'Move column (replace) to', icon: '➤', event: 'move-column-replace' },
    { id: 'divider2', type: 'divider', },
    { id: 'delete-column', type: 'action', label: 'Delete column', icon: '🗑', event: 'delete-column' },
  ],

  'row-header': [
    { id: 'append-row', type: 'action', label: 'Append row to end', icon: '➕', event: 'append-row' },
    { id: 'insert-row', type: 'action', label: 'Insert row before', icon: '➕', event: 'insert-row' },
    { id: 'divider1', type: 'divider', },
    { id: 'move-row-insert', type: 'input', label: 'Move row (insert) to', icon: '➤', event: 'move-row-insert' },
    { id: 'move-row-replace', type: 'input', label: 'Move row (replace) to', icon: '➤', event: 'move-row-replace' },
    { id: 'divider2', type: 'divider', },
    { id: 'delete-row', type: 'action', label: 'Delete row', icon: '🗑', event: 'delete-row' },
  ]
}

export const getActionMenuEventNames = () => {
  const events = new Set()

  Object.values(actionMenuConfig).forEach(menuItems => {
    menuItems.forEach(item => {
      if (item.event) {
        events.add(item.event)
      }
    })
  })

  // add 'close-menu' manually (used in checkbox setters)
  events.add('close-menu')

  return Array.from(events).sort()
}

export const getMenuItems = (menuType) => {
  return actionMenuConfig[menuType]
}
