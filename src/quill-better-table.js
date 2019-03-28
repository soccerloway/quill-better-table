import Quill from 'quill'
import Delta from 'quill-delta'

const Module = Quill.import('core/module')

import {
  TableCellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableViewWrapper,
  rowId,
  cellId
} from './formats/table';

class BetterTable extends Module {
  static register() {
    Quill.register(TableCellLine, true);
    Quill.register(TableCell, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableContainer, true);
    Quill.register(TableViewWrapper, true);
  }

  constructor(...args) {
    super(...args);
  }

  getTable(range = this.quill.getSelection()) {
    if (range == null) return [null, null, null, -1];
    const [cellLine, offset] = this.quill.getLine(range.index);
    if (cellLine == null || cellLine.statics.blotName !== TableCellLine.blotName) {
      return [null, null, null, -1];
    }
    const cell = cellLine.tableCell();
    const row = cell.row();
    const table = row.table();
    return [table, row, cell, offset];
  }

  insertTable(rows, columns) {
    const range = this.quill.getSelection(true)
    if (range == null) return
    let currentBlot = this.quill.getLeaf(range.index)[0]
    let nextBlot = this.quill.getLeaf(range.index + 1)[0]
    let delta = new Delta().retain(range.index)

    delta.insert('\n')
    delta = new Array(rows).fill(0).reduce(memo => {
      let tableRowId = rowId()
      return new Array(columns).fill('\n').reduce((memo, text) => {
        memo.insert(text, { 'table-cell-line': {row: tableRowId, cell: cellId()} });
        return memo
      }, memo)
    }, delta)

    this.quill.updateContents(delta, Quill.sources.USER)
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
  }
}

export default BetterTable;
