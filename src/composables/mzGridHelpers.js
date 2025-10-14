import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

export function useMZGridHelpers() {
  const appStore = useAppStore()
  const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

  const ck = (r, c) => `${r},${c}`

  const columnLabel = (n) => {
    let s = ''
    while (n > 0) {
      const rem = (n - 1) % 26
      s = String.fromCharCode(65 + rem) + s
      n = Math.floor((n - 1) / 26)
    }
    return s
  }

  // --- core utils ---
  const inBounds = (r, c) => {
    const g = storeMZpage.grid
    return r >= 1 && c >= 1 && r <= g.rows && c <= g.cols
  }

  const ensureCols = (n) => {
    // while (storeMZpage.grid.cols < n) storeMZpage.grid.cols += 1
    if(storeMZpage.grid.cols < n) storeMZpage.grid.cols = n
  }

  const ensureRows = (n) => {
    // while (storeMZpage.grid.rows < n) storeMZpage.grid.rows += 1
    if(storeMZpage.grid.rows < n) storeMZpage.grid.rows = n
  }

  const findPlotPosition = (plotId) => {
    const cells = storeMZpage.cells
    for (const k in cells) {
      if (cells[k] === plotId) {
        const [r, c] = k.split(',').map(Number)
        return { r, c }
      }
    }
    return null
  }

  const findNextEmptyRowInCol = (c, startRow = 1) => {
    for (let r = startRow; r <= storeMZpage.grid.rows; r++) {
      if (!storeMZpage.cells[ck(r, c)]) return r
    }
    return null
  }

  const pushDownFrom = (r, c) => {
    if (storeMZpage.cells[ck(storeMZpage.grid.rows, c)]) storeMZpage.grid.rows += 1
    for (let row = storeMZpage.grid.rows; row > r; row--) {
      storeMZpage.cells[ck(row, c)] = storeMZpage.cells[ck(row - 1, c)] || undefined
    }
    delete storeMZpage.cells[ck(r, c)]
  }

  // --- public ops you call from UI ---

  // First-load initializer: create grid and seed first two plots down column A
  const initGrid = (cols = 3, rows = 3, firstTwoPlotIds = []) => {
    storeMZpage.grid.cols = cols
    storeMZpage.grid.rows = rows
    storeMZpage.cells = {}
    firstTwoPlotIds.forEach((pid, i) => {
      const r = i + 1, c = 1
      if (r <= rows) storeMZpage.cells[ck(r, c)] = pid
    })
  }

  // Overwrite (replace if occupied)
  const placeOverwrite = (plotId, r, c) => {
    if (!inBounds(r, c)) return
    storeMZpage.cells[ck(r, c)] = plotId
  }

  // Insert (push existing down in that column)
  const placeInsert = (plotId, r, c) => {
    if (!inBounds(r, c)) return
    if (storeMZpage.cells[ck(r, c)]) pushDownFrom(r, c)
    storeMZpage.cells[ck(r, c)] = plotId
  }

  // Append one or more plots to a column (stacking)
  const appendToColumn = (plotIds, col) => {
    ensureCols(col)
    plotIds.forEach((pid) => {
      const row = findNextEmptyRowInCol(col)
      if (row) storeMZpage.cells[ck(row, col)] = pid
      else {
        storeMZpage.grid.rows += 1
        storeMZpage.cells[ck(storeMZpage.grid.rows, col)] = pid
      }
    })
  }

  // Remove helpers
  const removePlotAt = (r, c) => {
    if (!inBounds(r, c)) return null
    const pid = storeMZpage.cells[ck(r, c)]
    delete storeMZpage.cells[ck(r, c)]
    return pid || null
  }

  const removePlotById = (plotId) => {
    const pos = findPlotPosition(plotId)
    if (!pos) return null
    delete storeMZpage.cells[ck(pos.r, pos.c)]
    return pos
  }

  // Toggle single plot (from data-table icon)
  // opts = { plotId, mode: 'append-col'|'insert'|'overwrite', col, row }
  const togglePlot = (opts) => {
    const existing = findPlotPosition(opts.plotId)
    if (existing) {
      delete storeMZpage.cells[ck(existing.r, existing.c)]
      return { action: 'removed', where: existing }
    }
    if (opts.mode === 'append-col') {
      appendToColumn([opts.plotId], opts.col)
      return { action: 'added', where: { col: opts.col } }
    }
    if (opts.mode === 'insert') {
      placeInsert(opts.plotId, opts.row, opts.col)
      return { action: 'added', where: { row: opts.row, col: opts.col } }
    }
    if (opts.mode === 'overwrite') {
      placeOverwrite(opts.plotId, opts.row, opts.col)
      return { action: 'added', where: { row: opts.row, col: opts.col } }
    }
    return { action: 'noop' }
  }

  // Toggle both plots (second data-table icon)
  // opts = { plotIds:[a,b], mode:'append-col'|'insert'|'overwrite', col, row }
  const toggleBothPlots = (opts) => {
    const present = opts.plotIds.map((pid) => ({ pid, pos: findPlotPosition(pid) }))
    const allPresent = present.every((x) => x.pos)
    if (allPresent) {
      present.forEach((x) => { delete storeMZpage.cells[ck(x.pos.r, x.pos.c)] })
      return { action: 'removed-both' }
    }
    if (opts.mode === 'append-col') {
      appendToColumn(opts.plotIds, opts.col)
      return { action: 'added-both', where: { col: opts.col } }
    }
    if (opts.mode === 'insert') {
      let r = opts.row
      const c = opts.col
      opts.plotIds.forEach((pid) => { placeInsert(pid, r, c); r += 1 })
      return { action: 'added-both', where: { startRow: opts.row, col: opts.col } }
    }
    if (opts.mode === 'overwrite') {
      let r = opts.row
      const c = opts.col
      opts.plotIds.forEach((pid) => { placeOverwrite(pid, r, c); r += 1 })
      return { action: 'added-both', where: { startRow: opts.row, col: opts.col } }
    }
    return { action: 'noop' }
  }

  // --- structure ops for header menus ---
  const addRow = (atIndex) => {
    const g = storeMZpage.grid
    const insertAt = Math.max(1, Math.min(atIndex, g.rows + 1))
    g.rows += 1
    for (let r = g.rows; r > insertAt; r--) {
      for (let c = 1; c <= g.cols; c++) {
        storeMZpage.cells[ck(r, c)] = storeMZpage.cells[ck(r - 1, c)] || undefined
      }
    }
    for (let c = 1; c <= g.cols; c++) delete storeMZpage.cells[ck(insertAt, c)]
  }

  const deleteRow = (rowIndex) => {
    const g = storeMZpage.grid
    if (rowIndex < 1 || rowIndex > g.rows) return
    for (let r = rowIndex; r < g.rows; r++) {
      for (let c = 1; c <= g.cols; c++) {
        storeMZpage.cells[ck(r, c)] = storeMZpage.cells[ck(r + 1, c)] || undefined
      }
    }
    for (let c = 1; c <= g.cols; c++) delete storeMZpage.cells[ck(g.rows, c)]
    g.rows = Math.max(1, g.rows - 1)
  }

  const addColumn = (atIndex) => {
    const g = storeMZpage.grid
    const insertAt = Math.max(1, Math.min(atIndex, g.cols + 1))
    g.cols += 1
    for (let c = g.cols; c > insertAt; c--) {
      for (let r = 1; r <= g.rows; r++) {
        storeMZpage.cells[ck(r, c)] = storeMZpage.cells[ck(r, c - 1)] || undefined
      }
    }
    for (let r = 1; r <= g.rows; r++) delete storeMZpage.cells[ck(r, insertAt)]
  }

  const deleteColumn = (colIndex) => {
    const g = storeMZpage.grid
    if (colIndex < 1 || colIndex > g.cols) return
    for (let c = colIndex; c < g.cols; c++) {
      for (let r = 1; r <= g.rows; r++) {
        storeMZpage.cells[ck(r, c)] = storeMZpage.cells[ck(r, c + 1)] || undefined
      }
    }
    for (let r = 1; r <= g.rows; r++) delete storeMZpage.cells[ck(r, g.cols)]
    g.cols = Math.max(1, g.cols - 1)
  }

  return {
    // keys + finders
    ck,
    columnLabel,
    findPlotPosition,

    // placement
    initGrid,
    placeOverwrite,
    placeInsert,
    appendToColumn,
    removePlotAt,
    removePlotById,
    togglePlot,
    toggleBothPlots,

    // structure ops
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
  }
}
