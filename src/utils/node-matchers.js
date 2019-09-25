import Quill from 'quill'
import { _omit, convertToHex } from './index'

const Delta = Quill.import('delta')

// rebuild delta
export function matchTableCell (node, delta, scroll) {
  const row = node.parentNode;
  const table = row.parentNode.tagName === 'TABLE'
    ? row.parentNode
    : row.parentNode.parentNode;
  const rows = Array.from(table.querySelectorAll('tr'));
  const cells = Array.from(row.querySelectorAll('td'));
  const rowId = rows.indexOf(row) + 1;
  const cellId = cells.indexOf(node) + 1;
  const colspan = node.getAttribute('colspan') || false
  const rowspan = node.getAttribute('rowspan') || false
  const cellBg = node.getAttribute('data-cell-bg') || node.style.backgroundColor // The td from external table has no 'data-cell-bg' 

  // bugfix: empty table cells copied from other place will be removed unexpectedly
  if (delta.length() === 0) {
    delta = new Delta().insert('\n', {
      'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan }
    })
    return delta
  }

  delta = delta.reduce((newDelta, op) => {
    if (op.insert && typeof op.insert === 'string') {
      const lines = []
      let insertStr = op.insert
      let start = 0
      for (let i = 0; i < op.insert.length; i++) {
        if (insertStr.charAt(i) === '\n') {
          if (i === 0) {
            lines.push('\n')
          } else {
            lines.push(insertStr.substring(start, i))
            lines.push('\n')
          }
          start = i + 1
        }
      }

      const tailStr = insertStr.substring(start)
      if (tailStr) lines.push(tailStr)

      lines.forEach(text => {
        text === '\n'
        ? newDelta.insert('\n', op.attributes)
        : newDelta.insert(text, _omit(op.attributes, ['table', 'table-cell-line']))
      })
    } else {
      newDelta.insert(op.insert, op.attributes)
    }

    return newDelta
  }, new Delta())
  
  return delta.reduce((newDelta, op) => {
    if (op.insert && typeof op.insert === 'string' &&
      op.insert.startsWith('\n')) {
      newDelta.insert(op.insert, Object.assign(
        {},
        Object.assign({}, { row: rowId }, op.attributes.table),
        { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan, 'cell-bg': cellBg } },
        _omit(op.attributes, ['table'])
      ))
    } else {
      // bugfix: remove background attr from the delta of table cell
      //         to prevent unexcepted background attr append.
      if (op.attributes && op.attributes.background && op.attributes.background === convertToHex(cellBg)) {
        newDelta.insert(op.insert, Object.assign(
          {},
          _omit(op.attributes, ['table', 'table-cell-line', 'background'])
        ))
      } else {
        newDelta.insert(op.insert, Object.assign(
          {},
          _omit(op.attributes, ['table', 'table-cell-line'])
        ))
      }
    }
    
    return newDelta
  }, new Delta())
}

// replace th tag with td tag
export function matchTableHeader (node, delta, scroll) {
  const row = node.parentNode;
  const table = row.parentNode.tagName === 'TABLE'
    ? row.parentNode
    : row.parentNode.parentNode;
  const rows = Array.from(table.querySelectorAll('tr'));
  const cells = Array.from(row.querySelectorAll('th'));
  const rowId = rows.indexOf(row) + 1;
  const cellId = cells.indexOf(node) + 1;
  const colspan = node.getAttribute('colspan') || false
  const rowspan = node.getAttribute('rowspan') || false

  // bugfix: empty table cells copied from other place will be removed unexpectedly
  if (delta.length() === 0) {
    delta = new Delta().insert('\n', {
      'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan }
    })
    return delta
  }

  delta = delta.reduce((newDelta, op) => {
    if (op.insert && typeof op.insert === 'string') {
      const lines = []
      let insertStr = op.insert
      let start = 0
      for (let i = 0; i < op.insert.length; i++) {
        if (insertStr.charAt(i) === '\n') {
          if (i === 0) {
            lines.push('\n')
          } else {
            lines.push(insertStr.substring(start, i))
            lines.push('\n')
          }
          start = i + 1
        }
      }

      const tailStr = insertStr.substring(start)
      if (tailStr) lines.push(tailStr)

      // bugfix: no '\n' in op.insert, push a '\n' to lines
      if (lines.indexOf('\n') < 0) {
        lines.push('\n')
      }

      lines.forEach(text => {
        text === '\n'
        ? newDelta.insert('\n', { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan } })
        : newDelta.insert(text, op.attributes)
      })
    } else {
      newDelta.insert(op.insert, op.attributes)
    }
    
    return newDelta
  }, new Delta())

  return delta.reduce((newDelta, op) => {
    if (op.insert && typeof op.insert === 'string' &&
      op.insert.startsWith('\n')) {
      newDelta.insert(op.insert, Object.assign(
        {},
        { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan } }
      ))
    } else {
      newDelta.insert(op.insert, Object.assign(
        {},
        _omit(op.attributes, ['table', 'table-cell-line'])
      ))
    }

    return newDelta
  }, new Delta())
}

// supplement colgroup and col
export function matchTable (node, delta, scroll) {
  let newColDelta = new Delta()
  const topRow = node.querySelector('tr')

  // bugfix: empty table will return empty delta
  if (topRow === null) return newColDelta

  const cellsInTopRow = Array.from(topRow.querySelectorAll('td'))
    .concat(Array.from(topRow.querySelectorAll('th')))
  const maxCellsNumber = cellsInTopRow.reduce((sum, cell) => {
    const cellColspan = cell.getAttribute('colspan') || 1
    sum = sum + parseInt(cellColspan, 10)
    return sum
  }, 0)
  const colsNumber = node.querySelectorAll('col').length

  // issue #2
  // bugfix: the table copied from Excel had some default col tags missing
  //         add missing col tags
  if (colsNumber === maxCellsNumber) {
    return delta
  } else {
    for (let i = 0; i < maxCellsNumber - colsNumber; i++) {
      newColDelta.insert('\n', { 'table-col': true })
    }
    
    if (colsNumber === 0) return newColDelta.concat(delta)

    let lastNumber = 0
    return delta.reduce((finalDelta, op) => {
      finalDelta.insert(op.insert, op.attributes)
  
      if (op.attributes && op.attributes['table-col']) {
        lastNumber += op.insert.length
        if (lastNumber === colsNumber) {
          finalDelta = finalDelta.concat(newColDelta)
        }
      }
  
      return finalDelta
    }, new Delta())
  }
}
