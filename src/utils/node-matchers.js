import Quill from 'quill'
import { _omit } from './index'
import { CELL_ATTRIBUTES } from '../formats/table';

const Delta = Quill.import('delta')

// rebuild delta
export function matchTableCell (node, delta, scroll) {
  const CELL_ATTRIBUTES = ['rowspan', 'colspan']

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
      newDelta.insert('\n', Object.assign(
        {},
        Object.assign({}, { row: rowId }, op.attributes.table),
        { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan } },
        _omit(op.attributes, ['table'])
      ))
        .insert(op.insert.substring(1), _omit(op.attributes, ['table', 'table-cell-line']))
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
  let newDelta = new Delta()

  const topRow = node.querySelector('tr')
  const cellsInTopRow = Array.from(topRow.querySelectorAll('td'))
  const maxCellsNumber = cellsInTopRow.reduce((sum, cell) => {
    const cellColspan = cell.getAttribute('colspan') || 1
    sum = sum + parseInt(cellColspan, 10)
    return sum
  }, 0)
  const colsNumber = node.querySelectorAll('col').length

  // issue #2
  // bugfix: the table copied from Excel had some default col tags missing
  //         add missing col tags
  for (let i = 0; i < maxCellsNumber - colsNumber; i++) {
    newDelta.insert('\n', { 'table-col': true })
  }

  newDelta = newDelta.concat(delta)

  return newDelta
}
