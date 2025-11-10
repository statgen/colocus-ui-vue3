import { computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, MULTIZOOM_PAGE_OPTIONS, PAGE_NAMES } from '@/constants'
import { parseVariant2 } from '@/util/util'

export function useMZGridHelpers() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  const addColumn = () => {
    const newColNum = storeMZpage.gridSettings.cols + 1
    storeMZpage.gridSettings.cols = newColNum

    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      setGridMap(r, newColNum, 'mock')
    }
  }

  const addPlotToCell = (row, col, plotID, options = {}) => {
    const { replace = true, pushDown = false } = options
    const key = cellKey(row, col)
    const existing = storeMZpage.gridMap.value[key]

    if (pushDown && existing && existing !== 'mock') {
      pushColumnDown(col, row)
    } else if (!replace && existing && existing !== 'mock') {
      console.warn(`Cell ${cellLabel(row, col)} already contains plot ${existing}`)
      return false
    }

    // Remove plot from old location if it exists elsewhere
    const oldLocation = findPlotCell(plotID)
    if (oldLocation) {
      setGridMap(oldLocation.row, oldLocation.col, 'mock')
    }

    setGridMap(row, col, plotID)
    return true
  }

  const addRow = () => {
    const newRowNum = storeMZpage.gridSettings.rows + 1
    storeMZpage.gridSettings.rows = newRowNum

    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      setGridMap(newRowNum, c, 'mock')
    }
  }

  const cellKey = (row, col) => `${row},${col}`

  const cellLabel = (row, col) => `${row}${columnLabel(col)}`

  const cellCRLabel = (cell) => {
    const [row, col] = cell.split(',')
    return `${columnLabel(col)}${row}`
  }

  const columnLabel = (n) => {
    let s = ''
    while (n > 0) {
      const rem = (n - 1) % 26
      s = String.fromCharCode(65 + rem) + s
      n = Math.floor((n - 1) / 26)
    }
    return s
  }

  const columnNumber = (c) => {
    const s = c.toUpperCase()
    let result = 0
    for (let i = 0; i < s.length; i++) {
      result = result * 26 + (s.charCodeAt(i) - 65 + 1)
    }
    return result
  }

  const deletePlot = (plotID) => {
    const cell = findPlotCell(plotID)
    setGridMap(cell.row, cell.col, 'mock')

    const slot = storeMZpage.plotRegistry[plotID].slot
    const colocID = storeMZpage.plotRegistry[plotID].colocID
    storeMZpage.reusablePlotIDs.push(plotID)
    setRowSlotPlotID(colocID, slot, null)
    delete storeMZpage.plotRegistry[plotID]
  }

  const deleteAllPlots = async () => {
    for (const plotID of Object.keys(storeMZpage.plotRegistry)) {
      deletePlot(plotID)
      await nextTick()
    }
    prepPlotSession()
  }

  const deleteColumn = (col) => {
    if (storeMZpage.gridSettings.cols <= 1) {
      console.warn('Cannot delete last column')
      return false
    }

    const maxCol = storeMZpage.gridSettings.cols

    for (let c = col; c < maxCol; c++) {
      for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
        const currentKey = cellKey(r, c)
        const nextKey = cellKey(r, c + 1)
        storeMZpage.gridMap.value[currentKey] = storeMZpage.gridMap.value[nextKey] || 'mock'
      }
    }

    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      delete storeMZpage.gridMap[cellKey(r, maxCol)]
    }

    storeMZpage.gridSettings.cols = maxCol - 1
    return true
  }

  const deleteRow = (row) => {
    if (storeMZpage.gridSettings.rows <= 1) {
      console.warn('Cannot delete last row')
      return false
    }

    const maxRow = storeMZpage.gridSettings.rows

    for (let r = row; r < maxRow; r++) {
      for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
        const currentKey = cellKey(r, c)
        const nextKey = cellKey(r + 1, c)
        storeMZpage.gridMap[currentKey] = storeMZpage.gridMap[nextKey] || 'mock'
      }
    }

    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      delete storeMZpage.gridMap[cellKey(maxRow, c)]
    }

    storeMZpage.gridSettings.rows = maxRow - 1
    return true
  }

  const ensureRowsCols = (rows, cols) => {
    while(storeMZpage.gridSettings.rows < rows) addRow()
    while(storeMZpage.gridSettings.cols < cols) addColumn()
  }

  const exportPlotContainer = async (elID, fileName) => {
    const el = document.getElementById(elID)

    setTimeout(async () => {
      try {
        el.classList.add('export-mode')
        storeMZpage.isExporting = true
        await new Promise(resolve => setTimeout(resolve, 10))
        const canvas = await html2canvas(el, {
          useCORS: true,
          scale: LZ2_DISPLAY_OPTIONS.EXPORT_SCALE,
          backgroundColor: LZ2_DISPLAY_OPTIONS.PLOT_BACKGROUND_COLOR,
          width: el.scrollWidth,
          windowWidth: el.scrollWidth + 20,
        })
        const blob = await new Promise(res => canvas.toBlob(res))
        if (!blob) return
        const url = URL.createObjectURL(blob)
        try {
          const a = document.createElement('a')
          a.href = url
          a.download = `${fileName}.png`
          a.style.display = 'none'
          document.body.appendChild(a)   // helps Firefox reliability
          a.click()
          a.remove()
        } finally {
          // delay revocation so some browsers don’t cancel the download
          setTimeout(() => URL.revokeObjectURL(url), 0)
        }
      } finally {
        el.classList.remove('export-mode')
        storeMZpage.isExporting = false
      }
    }, 0)
  }

  const findPlotCell = (plotID) => {
    for (const [key, val] of Object.entries(storeMZpage.gridMap)) {
      if (val.toString() === plotID.toString()) {
        const { row, col } = parseCell(key)
        return { row, col, key }
      }
    }
    return null
  }

  const getAllPlots = computed(() => {
    const plots = []
    if (!storeMZpage.gridMap) return plots

    for (const [key, val] of Object.entries(storeMZpage.gridMap)) {
      if (val !== 'mock') {
        const { row, col } = parseCell(key)
        plots.push({ plotID: val, row, col, key })
      }
    }
    return plots
  })

  const getPlotAt = (row, col) => {
    const key = cellKey(row, col)
    const val = storeMZpage.gridMap?.[key]
    return val && val !== 'mock' ? val : null
  }

  const getPlotIDfromRowSlot = (colocID, slot) => {
    return storeMZpage.rowSlotToPlotID?.[colocID]?.[slot] ?? null
  }

  const initializeGridMap = () => {
    if (!storeMZpage.gridMap) storeMZpage.gridMap = {}
    ensureRowsCols(MULTIZOOM_PAGE_OPTIONS.defaultRows, MULTIZOOM_PAGE_OPTIONS.defaultCols)
  }

  const insertColumn = (atCol) => {
    const maxCol = storeMZpage.gridSettings.cols
    storeMZpage.gridSettings.cols = maxCol + 1

    for (let c = maxCol; c >= atCol; c--) {
      for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r, c + 1)
        storeMZpage.gridMap[newKey] = storeMZpage.gridMap[oldKey]
      }
    }

    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      setGridMap(r, atCol, 'mock')
    }
  }

  const insertRow = (atRow) => {
    const maxRow = storeMZpage.gridSettings.rows
    storeMZpage.gridSettings.rows = maxRow + 1

    for (let r = maxRow; r >= atRow; r--) {
      for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r + 1, c)
        storeMZpage.gridMap[newKey] = storeMZpage.gridMap[oldKey]
      }
    }

    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      setGridMap(atRow, c, 'mock')
    }
  }

  const moveColumn = (fromCol, toCol) => {
    if (fromCol === toCol) return

    const tempCol = {}
    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      tempCol[r] = storeMZpage.gridMap[cellKey(r, fromCol)]
    }

    if (fromCol < toCol) {
      for (let c = fromCol; c < toCol; c++) {
        for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r, c + 1)]
        }
      }
    } else {
      for (let c = fromCol; c > toCol; c--) {
        for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r, c - 1)]
        }
      }
    }

    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      storeMZpage.gridMap[cellKey(r, toCol)] = tempCol[r]
    }
  }

  const movePlot = (plotID, toRow, toCol, replace = true) => {
    ensureRowsCols(toRow, toCol)
    const oldLocation = findPlotCell(plotID)
    if (!oldLocation) {
      console.warn(`Plot ${plotID} not found in grid`)
      return false
    }

    const targetKey = cellKey(toRow, toCol)
    const targetContent = storeMZpage.gridMap[targetKey]

    if (!replace && targetContent && targetContent !== 'mock') {
      console.warn(`Target cell ${cellLabel(toRow, toCol)} already occupied`)
      return false
    }

    setGridMap(oldLocation.row, oldLocation.col, 'mock')
    setGridMap(toRow, toCol, plotID)
    storeMZpage.plotRegistry[plotID].cell = cellKey(toRow, toCol)
    storeMZpage.plotMoved = !storeMZpage.plotMoved
    return true
  }

  const moveRow = (fromRow, toRow) => {
    if (fromRow === toRow) return

    const tempRow = {}
    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      tempRow[c] = storeMZpage.gridMap[cellKey(fromRow, c)]
    }

    if (fromRow < toRow) {
      for (let r = fromRow; r < toRow; r++) {
        for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r + 1, c)]
        }
      }
    } else {
      for (let r = fromRow; r > toRow; r--) {
        for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r - 1, c)]
        }
      }
    }

    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      storeMZpage.gridMap[cellKey(toRow, c)] = tempRow[c]
    }
  }

  const parseCell = (cellKey) => {
    const [row, col] = cellKey.split(',').map(Number)
    return { row, col }
  }

  const parseCRReference = (cellRef) => {
    const match = cellRef.toUpperCase().match(/^([A-Z]+)(\d+)$/)

    if (!match) {
      console.error(`Invalid cell reference: ${cellRef}`)
    }

    const [, colLabel, rowStr] = match

    return {
      col: columnNumber(colLabel),  // Reuse your existing function
      row: parseInt(rowStr, 10)
    }
  }

  const prepPlotSession = () => {
    storeMZpage.plotRegistry = {}
    storeMZpage.rowSlotToPlotID = {}
    storeMZpage.plotCounter = 1
    storeMZpage.reusablePlotIDs.length = 0
  }

  const pushColumnDown = (col, fromRow) => {
    const maxRow = storeMZpage.gridSettings.rows

    if (fromRow === maxRow) {
      addRow()
    }

    for (let r = storeMZpage.gridSettings.rows; r > fromRow; r--) {
      const sourceKey = cellKey(r - 1, col)
      const targetKey = cellKey(r, col)
      storeMZpage.gridMap[targetKey] = storeMZpage.gridMap[sourceKey]
    }

    setGridMap(fromRow, col, 'mock')
  }

  const renderPlot = async (args) => {
    const [r, c] = args.cell.split(',')
    ensureRowsCols(parseInt(r), parseInt(c))
    const { cell, colocID, signal, slot } = args
    const signalID = signal.uuid

    if (storeMZpage.addUniqueRefsOnly) {
      const signals = Object.values(storeMZpage.plotRegistry).map(v => v.signalID)
      if (signals.includes(signalID)) return
    }

    const plotID = appStore.getNextPlotID()
    const variant = signal.lead_variant.vid

    storeMZpage.plotRegistry[plotID] = {
      cell: args.cell,
      colocID: colocID,
      showGenSigLine: storeMZpage.showGenSigLines,
      showPlotID: storeMZpage.showPlotID,
      showRecombLine: storeMZpage.showRecombLines,
      signal: signal,
      signalID,
      slot: slot,
      variant,
    }

    storeMZpage.gridMap[cell] = plotID
    setRowSlotPlotID(colocID, slot, plotID)
    return plotID
  }

  const setGridMap = (row, col, plotID) => {
    const key = cellKey(row, col)
    if (plotID === null || plotID === 'mock') {
      storeMZpage.gridMap[key] = 'mock'
    } else {
      storeMZpage.gridMap[key] = plotID
    }
  }

  const setPlotRegion = (variant, region) => {
    const pv = parseVariant2(variant, region)
    storeMZpage.xStart = pv.start
    storeMZpage.xEnd = pv.end
  }

  const setRowSlotPlotID = (colocID, slot, plotID) => {
    if (!storeMZpage.rowSlotToPlotID[colocID]) storeMZpage.rowSlotToPlotID[colocID] = {}
    storeMZpage.rowSlotToPlotID[colocID][slot] = plotID
  }

  const swapCells = (row1, col1, row2, col2) => {
    const key1 = cellKey(row1, col1)
    const key2 = cellKey(row2, col2)
    const temp = storeMZpage.gridMap[key1]
    storeMZpage.gridMap[key1] = storeMZpage.gridMap[key2]
    storeMZpage.gridMap[key2] = temp
  }

  return {
    addColumn,
    addPlotToCell,
    addRow,
    cellKey,
    cellLabel,
    cellCRLabel,
    columnLabel,
    columnNumber,
    deleteAllPlots,
    deleteColumn,
    deletePlot,
    deleteRow,
    exportPlotContainer,
    findPlotCell,
    getAllPlots,
    getPlotAt,
    getPlotIDfromRowSlot,
    initializeGridMap,
    insertColumn,
    insertRow,
    moveColumn,
    movePlot,
    moveRow,
    parseCell,
    parseCRReference,
    prepPlotSession,
    renderPlot,
    setGridMap,
    setPlotRegion,
    setRowSlotPlotID,
    swapCells,
  }
}
