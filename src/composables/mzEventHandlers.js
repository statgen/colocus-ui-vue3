import { ref } from 'vue'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, MZ_GRID_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'

export function useMZGridEventHandlers() {
  const mzGridHelpers = useMZGridHelpers()
  const appStore = useAppStore()
  const multizoomPage = PAGE_NAMES.MULTIZOOM
  const storeMZpage = appStore[multizoomPage]

  const menuState = ref({
    visible: false,
    type: 'hamburger',
    context: {},
    xPos: 0,
    yPos: 0,
  })

  const showPlotActionMenu = (args) => {
    const target = args.event.target.closest('.mock-plot, .grid-header, [data-action="hamburger-menu"]') || args.event.target
    const rect = target.getBoundingClientRect()

    const ySpace = 32
    const menuWidth = MZ_GRID_DISPLAY_OPTIONS.actionMenuWidth
    const xPos = rect.left + (rect.width / 2) - (menuWidth / 2)
    const yPos = args.event.clientY + window.scrollY + ySpace

    menuState.value = {
      visible: true,
      type: args.menuType,
      context: {
        col: args.col,
        colocID: args.colocID,
        plotID: args.plotID,
        row: args.row,
        signal: args.signal,
        slot: args.slot,
      },
      xPos: xPos,
      yPos: yPos,
    }
  }

// *** Event handlers (grid) ***************************************************
  const onColumnHeaderClick = (args) => {
    showPlotActionMenu({ ...args, menuType: 'column-header' })
  }

  const onColumnMenu = (args) => {
    // console.log('column menu', args.col, args.kind, args.event)
  }

  const onMockClick = (args) => {
    showPlotActionMenu({ ...args, menuType: 'mock-cell' })
  }

  const onMockMenu = (args) => {
    // console.log('mock menu', args.row, args.col, args.event)
  }

  const onNativeClick = (event) => {
    const action = event.target.dataset.action;

    switch(action) {
      case 'hamburger-menu':
        const plotID = event.target.dataset.plotId
        storeMZpage.activePlotID = plotID
        showPlotActionMenu({plotID, menuType: 'hamburger', event})
        break;

      case 'gene-hamburger-menu':
        const genePanelID = event.target.dataset.genePanelId
        storeMZpage.activeGenePanelID = genePanelID
        showPlotActionMenu({genePanelID, menuType: 'gene-hamburger', event})
        break;

      default:
        console.warn('Unknown click event')
        break;
    }
  }

  const onRowHeaderClick = (args) => {
    showPlotActionMenu({ ...args, menuType: 'row-header' })
  }

  const onRowMenu = (args) => {
    // console.log('row menu', args.row, args.kind, args.event)
  }

// *** Event handlers (action menu) ********************************************
  const onAppendColumn = () => {
    menuState.value.visible = false
    mzGridHelpers.appendColumn()
  }

  const onAddGenePanel = async (args) => {
    menuState.value.visible = false
    const cell = mzGridHelpers.cellKey(args.row, args.col)
    await mzGridHelpers.addGenePanel(cell)
  }

  const onAddPlot = async ({ colocID, inputValue, insert, signal, slot }) => {
    menuState.value.visible = false
    if(!inputValue) return
    const cell = inputValue.toUpperCase()
    await mzGridHelpers.addPlot({ cell, colocID, insert, signal, slot })
  }

  const onAppendRow = () => {
    menuState.value.visible = false
    mzGridHelpers.appendRow()
  }

  const onInsertRow = (args) => {
    menuState.value.visible = false
    const atRow = args.row
    mzGridHelpers.insertRow(atRow)
  }

  const onDeleteCell = (args) => {
    menuState.value.visible = false
    mzGridHelpers.deleteMockCell(args.row, args.col)
  }

  const onDeleteColumn = (args) => {
    menuState.value.visible = false
    const atCol = args.col
    mzGridHelpers.deleteColumn(atCol)
  }

  const onDeleteGenePanel = () => {
    menuState.value.visible = false
    const genePanelID = storeMZpage.activeGenePanelID
    if(genePanelID) mzGridHelpers.deleteGenePanel(genePanelID)
  }

  const onDeletePlot = () => {
    menuState.value.visible = false
    const plotID = storeMZpage.activePlotID
    if(plotID) mzGridHelpers.deletePlot(plotID, true)
  }

  const onDeleteRow = (args) => {
    menuState.value.visible = false
    const atRow = args.row
    mzGridHelpers.deleteRow(atRow)
  }

  const onExportPlot = async () => {
    menuState.value.visible = false
    const plotDOMid = `plot_${storeMZpage.activePlotID}`
    await mzGridHelpers.exportPlotContainer(plotDOMid, `Colocus_${plotDOMid}`)
  }

  const onInsertColumn = (args) => {
    menuState.value.visible = false
    const atCol = args.col
    mzGridHelpers.insertColumn(atCol)
  }

  const onInsertMockCell = (args) => {
    menuState.value.visible = false
    if(args.plotID) { // user clicked hamburger menu
      const cell = mzGridHelpers.getPlotCell(args.plotID)
      const { col, row } = mzGridHelpers.parseCRReference(cell)
      mzGridHelpers.insertMockCell(row, col)
    } else if(args.row && args.col) { // user clicked empty/mock cell
      mzGridHelpers.insertMockCell(args.row, args.col)
    }
  }

  const onMoveColumn = (args) => {
    menuState.value.visible = false
    const iv = args.inputValue
    if(!iv) return
    const fromCol = args.col
    const toCol = mzGridHelpers.columnNumber(iv)
    const insert = args.insert
    mzGridHelpers.moveColumn(fromCol, toCol, insert)
  }

  const onMovePlot = ({ inputValue, insert, plotID }) => {
    menuState.value.visible = false
    if(!inputValue || !plotID) return
    const pid = parseInt(plotID)
    const toCell = inputValue.toUpperCase()
    mzGridHelpers.movePlot({ insert, plotID: pid, toCell})
  }

  const onMoveRow = (args) => {
    menuState.value.visible = false
    const fromRow = args.row
    const toRow = args.inputValue
    const insert = args.insert
    mzGridHelpers.moveRow(fromRow, toRow, insert)
  }

// *** Event handlers (misc) ***************************************************
  const onExportPlotGroup = async () => {
    await mzGridHelpers.exportPlotContainer(LZ2_DISPLAY_OPTIONS.PLOTS_CONTAINER_ID, 'Colocus_plot_group')
  }

  const onPlotIconClick = async (args) => {
    const plotID = args.plotID
    storeMZpage.activePlotID = plotID
    showPlotActionMenu({ ...args, menuType: 'datatable' })
  }

  return {
    // grid event handlers
    onColumnHeaderClick,
    onColumnMenu,
    onMockClick,
    onMockMenu,
    onNativeClick,
    onRowHeaderClick,
    onRowMenu,
    // action menu event handlers
    onAddGenePanel,
    onAppendColumn,
    onAppendRow,
    onAddPlot,
    onInsertRow,
    onDeleteCell,
    onDeleteColumn,
    onDeleteGenePanel,
    onDeletePlot,
    onDeleteRow,
    onExportPlot,
    onInsertColumn,
    onInsertMockCell,
    onMoveColumn,
    onMovePlot,
    onMoveRow,
    // misc
    menuState,
    onExportPlotGroup,
    onPlotIconClick,
  }
}
