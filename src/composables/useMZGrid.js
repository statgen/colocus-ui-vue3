/**
 * Composable for MultiZoom Grid operations
 *
 * Works with lean store approach:
 * - gridMap is dynamically built from user interactions
 * - plotRegistry only stores metadata (colocID, signalID, variant, etc.)
 * - No render functions or data in store
 */
import { computed } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

export function useMZGrid() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  const parseCell = (cellKey) => {
    const [row, col] = cellKey.split(',').map(Number)
    return { row, col }
  }

  const cellKey = (row, col) => `${row},${col}`

  const columnLabel = (n) => {
    let s = ''
    while (n > 0) {
      const rem = (n - 1) % 26
      s = String.fromCharCode(65 + rem) + s
      n = Math.floor((n - 1) / 26)
    }
    return s
  }

  const cellLabel = (row, col) => `${row}${columnLabel(col)}`

  // const getPlotAt = (row, col) => {
  //   const key = cellKey(row, col)
  //   const val = storeMZpage.gridMap?.[key]
  //   return val && val !== 'mock' ? val : null
  // }

  const getPlotAt = (row, col) => {
    const key = `${row},${col}`
    const val = storeMZpage.gridMap?.[key]  // ✅ Vue tracks this dependency
    return val && val !== 'mock' ? val : null
  }

  const findPlotCell = (plotID) => {
    if (!storeMZpage.gridMap) return null

    for (const [key, val] of Object.entries(storeMZpage.gridMap)) {
      if (val === plotID) {
        const { row, col } = parseCell(key)
        return { row, col, key }
      }
    }
    return null
  }

  /**
   * Initialize gridMap with default cells (2 cols × 4 rows = 8 cells)
   * Call this once on page mount if gridMap doesn't exist
   */
  const initializeGridMap = () => {
    if (!storeMZpage.gridMap) {
      storeMZpage.gridMap = {}
    }

    // Initialize all cells as mock
    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      for (let c = 1; c <= storeMZpage.grid.cols; c++) {
        const key = cellKey(r, c)
        if (!(key in storeMZpage.gridMap)) {
          storeMZpage.gridMap[key] = 'mock'
        }
      }
    }
  }

  const setCellContent = (row, col, plotID = 'mock') => {
    const key = cellKey(row, col)
    if (plotID === null || plotID === 'mock') {
      storeMZpage.gridMap[key] = 'mock'
    } else {
      storeMZpage.gridMap[key] = String(plotID)
    }
  }

  const addPlotToCell = (row, col, plotID, options = {}) => {
    const { replace = true, pushDown = false } = options
    const key = cellKey(row, col)
    const existing = storeMZpage.gridMap[key]

    if (pushDown && existing && existing !== 'mock') {
      pushColumnDown(col, row)
    } else if (!replace && existing && existing !== 'mock') {
      console.warn(`Cell ${cellLabel(row, col)} already contains plot ${existing}`)
      return false
    }

    // Remove plot from old location if it exists elsewhere
    const oldLocation = findPlotCell(plotID)
    if (oldLocation) {
      setCellContent(oldLocation.row, oldLocation.col, 'mock')
    }

    setCellContent(row, col, plotID)
    return true
  }

  const movePlot = (plotID, toRow, toCol, replace = true) => {
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

    setCellContent(oldLocation.row, oldLocation.col, 'mock')
    setCellContent(toRow, toCol, plotID)
    return true
  }

  const removePlot = (plotID, removeFromRegistry = false) => {
    const location = findPlotCell(plotID)
    if (location) {
      setCellContent(location.row, location.col, 'mock')

      if (removeFromRegistry && storeMZpage.plotRegistry?.[plotID]) {
        delete storeMZpage.plotRegistry[plotID]
      }
      return true
    }
    return false
  }

  const swapCells = (row1, col1, row2, col2) => {
    console.log('swapCells', row1, col1, row2, col2)
    const key1 = cellKey(row1, col1)
    const key2 = cellKey(row2, col2)
    const temp = storeMZpage.gridMap[key1]
    storeMZpage.gridMap[key1] = storeMZpage.gridMap[key2]
    storeMZpage.gridMap[key2] = temp
    storeMZpage.gridMap = { ...storeMZpage.gridMap }
  }

  const pushColumnDown = (col, fromRow) => {
    const maxRow = storeMZpage.grid.rows

    if (fromRow === maxRow) {
      addRow()
    }

    for (let r = storeMZpage.grid.rows; r > fromRow; r--) {
      const sourceKey = cellKey(r - 1, col)
      const targetKey = cellKey(r, col)
      storeMZpage.gridMap[targetKey] = storeMZpage.gridMap[sourceKey]
    }

    setCellContent(fromRow, col, 'mock')
  }

  const addRow = () => {
    const newRowNum = storeMZpage.grid.rows + 1
    storeMZpage.grid.rows = newRowNum

    for (let c = 1; c <= storeMZpage.grid.cols; c++) {
      setCellContent(newRowNum, c, 'mock')
    }
  }

  const insertRow = (atRow) => {
    const maxRow = storeMZpage.grid.rows
    storeMZpage.grid.rows = maxRow + 1

    for (let r = maxRow; r >= atRow; r--) {
      for (let c = 1; c <= storeMZpage.grid.cols; c++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r + 1, c)
        storeMZpage.gridMap[newKey] = storeMZpage.gridMap[oldKey]
      }
    }

    for (let c = 1; c <= storeMZpage.grid.cols; c++) {
      setCellContent(atRow, c, 'mock')
    }
  }

  const deleteRow = (row) => {
    if (storeMZpage.grid.rows <= 1) {
      console.warn('Cannot delete last row')
      return false
    }

    const maxRow = storeMZpage.grid.rows

    for (let r = row; r < maxRow; r++) {
      for (let c = 1; c <= storeMZpage.grid.cols; c++) {
        const currentKey = cellKey(r, c)
        const nextKey = cellKey(r + 1, c)
        storeMZpage.gridMap[currentKey] = storeMZpage.gridMap[nextKey] || 'mock'
      }
    }

    for (let c = 1; c <= storeMZpage.grid.cols; c++) {
      delete storeMZpage.gridMap[cellKey(maxRow, c)]
    }

    storeMZpage.grid.rows = maxRow - 1
    return true
  }

  const addColumn = () => {
    const newColNum = storeMZpage.grid.cols + 1
    storeMZpage.grid.cols = newColNum

    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      setCellContent(r, newColNum, 'mock')
    }
  }

  const insertColumn = (atCol) => {
    const maxCol = storeMZpage.grid.cols
    storeMZpage.grid.cols = maxCol + 1

    for (let c = maxCol; c >= atCol; c--) {
      for (let r = 1; r <= storeMZpage.grid.rows; r++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r, c + 1)
        storeMZpage.gridMap[newKey] = storeMZpage.gridMap[oldKey]
      }
    }

    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      setCellContent(r, atCol, 'mock')
    }
  }

  const deleteColumn = (col) => {
    if (storeMZpage.grid.cols <= 1) {
      console.warn('Cannot delete last column')
      return false
    }

    const maxCol = storeMZpage.grid.cols

    for (let c = col; c < maxCol; c++) {
      for (let r = 1; r <= storeMZpage.grid.rows; r++) {
        const currentKey = cellKey(r, c)
        const nextKey = cellKey(r, c + 1)
        storeMZpage.gridMap[currentKey] = storeMZpage.gridMap[nextKey] || 'mock'
      }
    }

    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      delete storeMZpage.gridMap[cellKey(r, maxCol)]
    }

    storeMZpage.grid.cols = maxCol - 1
    return true
  }

  const moveRow = (fromRow, toRow) => {
    if (fromRow === toRow) return

    const tempRow = {}
    for (let c = 1; c <= storeMZpage.grid.cols; c++) {
      tempRow[c] = storeMZpage.gridMap[cellKey(fromRow, c)]
    }

    if (fromRow < toRow) {
      for (let r = fromRow; r < toRow; r++) {
        for (let c = 1; c <= storeMZpage.grid.cols; c++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r + 1, c)]
        }
      }
    } else {
      for (let r = fromRow; r > toRow; r--) {
        for (let c = 1; c <= storeMZpage.grid.cols; c++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r - 1, c)]
        }
      }
    }

    for (let c = 1; c <= storeMZpage.grid.cols; c++) {
      storeMZpage.gridMap[cellKey(toRow, c)] = tempRow[c]
    }
  }

  const moveColumn = (fromCol, toCol) => {
    if (fromCol === toCol) return

    const tempCol = {}
    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      tempCol[r] = storeMZpage.gridMap[cellKey(r, fromCol)]
    }

    if (fromCol < toCol) {
      for (let c = fromCol; c < toCol; c++) {
        for (let r = 1; r <= storeMZpage.grid.rows; r++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r, c + 1)]
        }
      }
    } else {
      for (let c = fromCol; c > toCol; c--) {
        for (let r = 1; r <= storeMZpage.grid.rows; r++) {
          storeMZpage.gridMap[cellKey(r, c)] = storeMZpage.gridMap[cellKey(r, c - 1)]
        }
      }
    }

    for (let r = 1; r <= storeMZpage.grid.rows; r++) {
      storeMZpage.gridMap[cellKey(r, toCol)] = tempCol[r]
    }
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

  return {
    parseCell,
    cellKey,
    columnLabel,
    cellLabel,
    initializeGridMap,
    getPlotAt,
    findPlotCell,
    getAllPlots,
    addPlotToCell,
    movePlot,
    removePlot,
    setCellContent,
    swapCells,
    addRow,
    insertRow,
    deleteRow,
    moveRow,
    addColumn,
    insertColumn,
    deleteColumn,
    moveColumn,
  }
}
