import { computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import { useAppStore } from '@/stores/AppStore'
import { LZ2_DISPLAY_OPTIONS, MZ_GRID_DISPLAY_OPTIONS, PAGE_NAMES } from '@/constants'
import { parseVariant2 } from '@/util/util'

export function useMZGridHelpers() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  const appendColumn = () => {
    const col = storeMZpage.gridSettings.cols + 1
    storeMZpage.gridSettings.cols = col
    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      storeMZpage.gridMap[cellKey(r, col)] = 'mock'
    }
  }

  const addPlot = async ({ cell, colocID, signal, slot, insert }) => {
    const { row, col, isValid } = parseCRReference(cell)
    if(!isValid) return
    ensureRowsCols(Math.max(storeMZpage.gridSettings.rows, row), Math.max(storeMZpage.gridSettings.cols, col))
    if(insert) {
      pushColumnDown(row, col)
    } else {
      const existingPlotID = storeMZpage.gridMap[cell]
      if (existingPlotID !== 'mock') deletePlot(existingPlotID)
      await nextTick()
    }
    await renderPlot({ cell, colocID, signal, slot })
  }

  const appendRow = () => {
    const newRowNum = storeMZpage.gridSettings.rows + 1
    storeMZpage.gridSettings.rows = newRowNum
    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      storeMZpage.gridMap[cellKey(newRowNum, c)] = 'mock'
    }
  }

  const cellKey = (row, col) => {
    return `${columnLabel(col)}${row}`.toUpperCase()
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

  const deleteAllPlots = async () => {
    for (const plotID of Object.keys(storeMZpage.plotRegistry)) {
      deletePlot(plotID)
      await nextTick()
    }
    initializePlotSession()
  }

  const deleteColumn = (col) => {
    const maxCol = storeMZpage.gridSettings.cols

    // delete plots in column being removed
    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      const deleteKey = cellKey(r, col)
      const plotID = storeMZpage.gridMap[deleteKey]
      if (plotID && plotID !== 'mock') {
        deletePlot(plotID)
      }
      storeMZpage.gridMap[deleteKey] = 'mock'
    }

    // shift columns left
    for (let c = col + 1; c <= maxCol; c++) {
      for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
        const fromCell = cellKey(r, c)
        const toCell = cellKey(r, c - 1)
        const plotID = storeMZpage.gridMap[fromCell]

        if (plotID && plotID !== 'mock') {
          movePlot({ plotID, toCell, insert: false })
        } else {
          storeMZpage.gridMap[toCell] = 'mock'
        }
      }
    }

    // clean up last column
    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      delete storeMZpage.gridMap[cellKey(r, maxCol)]
    }

    storeMZpage.gridSettings.cols = maxCol - 1
  }

  const deleteMockCell = (row, col) => {
    const maxRow = storeMZpage.gridSettings.rows

    for (let r = row + 1; r <= maxRow; r++) {
      const fromCell = cellKey(r, col)
      const toCell = cellKey(r - 1, col)
      const plotID = storeMZpage.gridMap[fromCell]

      if (plotID && plotID !== 'mock') {
        movePlot({ plotID, toCell, insert: false })
      } else {
        storeMZpage.gridMap[toCell] = 'mock'
      }
    }

    storeMZpage.gridMap[cellKey(maxRow, col)] = 'mock'
  }

  const deletePlot = (plotID) => {
    if(!plotID || plotID === 'mock') return
    const cell = storeMZpage.plotRegistry[plotID].cell
    storeMZpage.gridMap[cell] = 'mock'

    const slot = storeMZpage.plotRegistry[plotID].slot
    const colocID = storeMZpage.plotRegistry[plotID].colocID
    storeMZpage.reusablePlotIDs.push(plotID)
    setRowSlotPlotID(colocID, slot, 'mock')
    delete storeMZpage.plotRegistry[plotID]
  }

  const deleteRow = (row) => {
    const maxRow = storeMZpage.gridSettings.rows

    // delete plots in row being removed
    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      const deleteKey = cellKey(row, c)
      const plotID = storeMZpage.gridMap[deleteKey]
      if (plotID && plotID !== 'mock') {
        deletePlot(plotID)
      }
      storeMZpage.gridMap[deleteKey] = 'mock'
    }

    // shift rows up
    for (let r = row + 1; r <= maxRow; r++) {
      for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
        const fromCell = cellKey(r, c)
        const toCell = cellKey(r - 1, c)
        const plotID = storeMZpage.gridMap[fromCell]

        if (plotID && plotID !== 'mock') {
          movePlot({ plotID, toCell, insert: false })
        } else {
          storeMZpage.gridMap[toCell] = 'mock'
        }
      }
    }

    // clean up last row
    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      delete storeMZpage.gridMap[cellKey(maxRow, c)]
    }

    storeMZpage.gridSettings.rows = maxRow - 1
  }

  const ensureRowsCols = (rows, cols) => {
    while(storeMZpage.gridSettings.rows < rows) appendRow()
    while(storeMZpage.gridSettings.cols < cols) appendColumn()
    while(storeMZpage.gridSettings.rows > rows) deleteRow(storeMZpage.gridSettings.rows)
    while(storeMZpage.gridSettings.cols > cols) deleteColumn(storeMZpage.gridSettings.cols)
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

  const getPlotCell = (plotID) => {
    return storeMZpage.plotRegistry[plotID].cell
  }

  const getPlotIDfromRowSlot = (colocID, slot) => {
    return storeMZpage.rowSlotToPlotID?.[colocID]?.[slot] ?? null
  }

  const initializePlotSession = () => {
    storeMZpage.plotRegistry = {}
    storeMZpage.rowSlotToPlotID = {}
    storeMZpage.plotCounter = 1
    storeMZpage.reusablePlotIDs.length = 0
    ensureRowsCols(MZ_GRID_DISPLAY_OPTIONS.defaultRows, MZ_GRID_DISPLAY_OPTIONS.defaultCols)
  }

  const insertColumn = (atCol) => {
    const maxCol = storeMZpage.gridSettings.cols
    storeMZpage.gridSettings.cols = maxCol + 1

    for (let c = maxCol; c >= atCol; c--) {
      for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r, c + 1)
        const plotID = storeMZpage.gridMap[oldKey]

        storeMZpage.gridMap[newKey] = plotID

        if (plotID && plotID !== 'mock' && storeMZpage.plotRegistry[plotID]) {
          storeMZpage.plotRegistry[plotID].cell = newKey
        }
      }
    }

    for (let r = 1; r <= storeMZpage.gridSettings.rows; r++) {
      storeMZpage.gridMap[cellKey(r, atCol)] = 'mock'
    }
  }

  const insertRow = (atRow) => {
    const maxRow = storeMZpage.gridSettings.rows
    storeMZpage.gridSettings.rows = maxRow + 1

    for (let r = maxRow; r >= atRow; r--) {
      for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
        const oldKey = cellKey(r, c)
        const newKey = cellKey(r + 1, c)
        const plotID = storeMZpage.gridMap[oldKey]

        storeMZpage.gridMap[newKey] = plotID

        if (plotID && plotID !== 'mock' && storeMZpage.plotRegistry[plotID]) {
          storeMZpage.plotRegistry[plotID].cell = newKey
        }
      }
    }

    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      storeMZpage.gridMap[cellKey(atRow, c)] = 'mock'
    }
  }

  const moveColumn = (fromCol, toCol, insert) => {
    if (fromCol === toCol) return
    let adjustedFromCol = fromCol

    if(insert) {
      insertColumn(toCol)

      // After inserting at toCol, if fromCol >= toCol, the fromCol data has shifted right by 1
      if (fromCol >= toCol) {
        adjustedFromCol += 1
      }
    }

    for (let row = 1; row <= storeMZpage.gridSettings.rows; row++) {
      const fromCell = cellKey(row, adjustedFromCol)
      const toCell = cellKey(row, toCol)
      const plotID = storeMZpage.gridMap[fromCell]
      if(plotID !== 'mock') movePlot({ plotID, toCell, insert: false})
    }
  }

  const movePlot = ({ plotID, toCell, insert }) => {
    if(!plotID) return
    const { row, col, isValid } = parseCRReference(toCell)
    if(!isValid) {
      console.warn(`movePlot: Invalid cell reference: ${toCell}`)
      return
    }

    const fromCell = storeMZpage.plotRegistry[plotID].cell
    storeMZpage.gridMap[fromCell] = 'mock'

    ensureRowsCols(Math.max(storeMZpage.gridSettings.rows, row), Math.max(storeMZpage.gridSettings.cols, col))

    if(insert) {
      pushColumnDown(row, col)
    } else {
      const existingPlotID = storeMZpage.gridMap[toCell]
      deletePlot(existingPlotID)
    }

    storeMZpage.gridMap[toCell] = plotID
    storeMZpage.plotRegistry[plotID].cell = toCell
    // await nextTick()
    storeMZpage.plotMoved = !storeMZpage.plotMoved
  }

  const moveRow = (fromRow, toRow, insert) => {
    if (fromRow === toRow) return
    let adjustedFromRow = fromRow

    if(insert) {
      insertRow(toRow)

      // After inserting at toRow, if fromRow >= toRow, the fromRow data has shifted down by 1
      if (fromRow >= toRow) {
        adjustedFromRow += 1
      }
    }

    for (let col = 1; col <= storeMZpage.gridSettings.cols; col++) {
      const fromCell = cellKey(adjustedFromRow, col)
      const toCell = cellKey(toRow, col)
      const plotID = storeMZpage.gridMap[fromCell]
      if(plotID !== 'mock') movePlot({ plotID, toCell, insert: false})
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
      return { row: undefined, col: undefined, isValid: false }
    }
    const [, col, row] = match
    return { col: columnNumber(col), row: parseInt(row), isValid: true }
  }

  const hasPlotInRow = (row) => {
    let hasPlot = false
    for (let c = 1; c <= storeMZpage.gridSettings.cols; c++) {
      const cellInLastRow = cellKey(row, c)
      if (storeMZpage.gridMap[cellInLastRow] && storeMZpage.gridMap[cellInLastRow] !== 'mock') {
        hasPlot = true
        break
      }
    }
    return hasPlot
  }

  const pushColumnDown = (row, col) => {
    const maxRow = storeMZpage.gridSettings.rows
    if(hasPlotInRow(maxRow)) {
      appendRow()
    }

    for (let r = storeMZpage.gridSettings.rows; r > row; r--) {
      const cellFrom = cellKey(r - 1, col)
      const cellTo = cellKey(r, col)
      const movedPlotID = storeMZpage.gridMap[cellFrom]

      storeMZpage.gridMap[cellTo] = movedPlotID

      if (movedPlotID && movedPlotID !== 'mock') {
        storeMZpage.plotRegistry[movedPlotID].cell = cellTo
      }
    }
    storeMZpage.gridMap[cellKey(row, col)] = 'mock'
  }

  const renderPlot = async ({ cell, colocID, signal, slot }) => {
    const { row, col } = parseCRReference(cell)
    // ensureRowsCols(row, col)
    const signalID = signal.uuid

    if (storeMZpage.addUniqueRefsOnly) {
      const signals = Object.values(storeMZpage.plotRegistry).map(v => v.signalID)
      if (signals.includes(signalID)) return
    }

    const plotID = appStore.getNextPlotID()
    const variant = signal.lead_variant.vid

    storeMZpage.plotRegistry[plotID] = {
      cell,
      colocID,
      showGenSigLine: storeMZpage.showGenSigLines,
      showPlotID: storeMZpage.showPlotID,
      showRecombLine: storeMZpage.showRecombLines,
      signal,
      signalID,
      slot,
      variant,
    }

    storeMZpage.gridMap[cell] = plotID
    setRowSlotPlotID(colocID, slot, plotID)
    return plotID
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
    addPlot,
    cellKey,
    columnLabel,
    columnNumber,
    deleteAllPlots,
    deleteColumn,
    deleteMockCell,
    deletePlot,
    deleteRow,
    exportPlotContainer,
    getAllPlots,
    getPlotCell,
    getPlotIDfromRowSlot,
    initializePlotSession,
    insertColumn,
    insertRow,
    moveColumn,
    movePlot,
    moveRow,
    parseCRReference,
    setPlotRegion,
    setRowSlotPlotID,
    swapCells,
  }
}
