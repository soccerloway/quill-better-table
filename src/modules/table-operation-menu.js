import Quill from 'quill'
import { css } from '../utils'

const MENU_MIN_HEIHGT = 150
const MENU_WIDTH = 200
const ERROR_LIMIT = 3

const MENU_ITEMS_DEFAULT = {
  insertColumnRight: {
    text: 'Insert column right',
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndex = getColToolCellIndexByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return Math.abs(cellRect.x + cellRect.width - boundary.x1) <= ERROR_LIMIT
        }
      )

      const newColumn = tableContainer.insertColumn(this.boundary, colIndex, true)
      this.tableColumnTool.updateToolCells()
      this.quill.update(Quill.sources.USER)
      this.quill.setSelection(
        this.quill.getIndex(newColumn[0]),
        0,
        Quill.sources.SILENT
      )
      this.tableSelection.setSelection(
        newColumn[0].domNode.getBoundingClientRect(),
        newColumn[0].domNode.getBoundingClientRect()
      )
    }
  },

  insertColumnLeft: {
    text: 'Insert column left',
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndex = getColToolCellIndexByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return Math.abs(cellRect.x - boundary.x) <= ERROR_LIMIT
        }
      )

      const newColumn = tableContainer.insertColumn(this.boundary, colIndex, false)
      this.tableColumnTool.updateToolCells()
      this.quill.update(Quill.sources.USER)
      this.quill.setSelection(
        this.quill.getIndex(newColumn[0]),
        0,
        Quill.sources.SILENT
      )
      this.tableSelection.setSelection(
        newColumn[0].domNode.getBoundingClientRect(),
        newColumn[0].domNode.getBoundingClientRect()
      )
    }
  },

  insertRowUp: {
    text: 'Insert row up',
    handler () {
      const tableContainer = Quill.find(this.table)
      const affectedCells = tableContainer.insertRow(this.boundary, false)
      this.quill.update(Quill.sources.USER)
      this.quill.setSelection(
        this.quill.getIndex(affectedCells[0]),
        0,
        Quill.sources.SILENT
      )
      this.tableSelection.setSelection(
        affectedCells[0].domNode.getBoundingClientRect(),
        affectedCells[0].domNode.getBoundingClientRect()
      )
    }
  },

  insertRowDown: {
    text: 'Insert row down',
    handler () {
      const tableContainer = Quill.find(this.table)
      const affectedCells = tableContainer.insertRow(this.boundary, true)
      this.quill.update(Quill.sources.USER)
      this.quill.setSelection(
        this.quill.getIndex(affectedCells[0]),
        0,
        Quill.sources.SILENT
      )
      this.tableSelection.setSelection(
        affectedCells[0].domNode.getBoundingClientRect(),
        affectedCells[0].domNode.getBoundingClientRect()
      )
    }
  },

  deleteColumn: {
    text: 'Delete selected columns',
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndexes = getColToolCellIndexesByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return cellRect.x + ERROR_LIMIT > boundary.x &&
            cellRect.x + cellRect.width - ERROR_LIMIT < boundary.x1
        }
      )

      let isDeleteTable = tableContainer.deleteColumns(this.boundary, colIndexes)
      if (!isDeleteTable) {
        this.tableColumnTool.updateToolCells()
        this.quill.update(Quill.sources.USER)
        this.tableSelection.clearSelection()
      }
    }
  },

  deleteRow: {
    text: 'Delete selected rows',
    handler () {
      const tableContainer = Quill.find(this.table)
      tableContainer.deleteRow(this.boundary)
      this.quill.update(Quill.sources.USER)
      this.tableSelection.clearSelection()
    }
  }
}

export default class TableOperationMenu {
  constructor (params, quill, options) {
    const betterTableModule = quill.getModule('better-table')
    this.tableSelection = betterTableModule.tableSelection
    this.table = params.table
    this.quill = quill
    this.options = options
    this.menuItems = Object.assign({}, MENU_ITEMS_DEFAULT, options.items)
    this.tableColumnTool = betterTableModule.columnTool
    this.boundary = this.tableSelection.boundary
    this.selectedTds = this.tableSelection.selectedTds
    this.destroyHanlder = this.destroy.bind(this)
    this.columnToolCells = this.tableColumnTool.colToolCells()

    this.menuInitial(params)
    this.mount()
    document.addEventListener("click", this.destroyHanlder, false)
  }

  mount () {
    document.body.appendChild(this.domNode)
  }

  destroy () {
    this.domNode.remove()
    document.removeEventListener("click", this.destroyHanlder, false)
    return null
  }

  menuInitial ({ table, left, top }) {
    this.domNode = document.createElement('div')
    this.domNode.classList.add('qlbt-operation-menu')
    css(this.domNode, {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      'min-height': `${MENU_MIN_HEIHGT}px`,
      width: `${MENU_WIDTH}px`
    })

    for (let name in this.menuItems) {
      if (this.menuItems[name]) {
        this.domNode.appendChild(this.menuItemCreator(this.menuItems[name]))
      }
    }
  }

  menuItemCreator ({ text, handler }) {
    const node = document.createElement('div')
    node.classList.add('qlbt-operation-menu-item')
    node.innerText = text
    node.addEventListener('click', handler.bind(this), false)
    return node
  }
}

function getColToolCellIndexByBoundary (cells, boundary, conditionFn) {
  return cells.reduce((findIndex, cell) => {
    let cellRect = cell.getBoundingClientRect()
    if (conditionFn(cellRect, boundary)) {
      findIndex = cells.indexOf(cell)
    }
    return findIndex
  }, false)
}

function getColToolCellIndexesByBoundary (cells, boundary, conditionFn) {
  return cells.reduce((findIndexes, cell) => {
    let cellRect = cell.getBoundingClientRect()
    if (conditionFn(cellRect, boundary)) {
      findIndexes.push(cells.indexOf(cell))
    }
    return findIndexes
  }, [])
}
