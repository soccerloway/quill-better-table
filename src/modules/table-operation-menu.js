import Quill from 'quill'
import { css, getRelativeRect } from '../utils'

// svg icons
import operationIcon1 from '../assets/icons/icon_operation_1.svg'
import operationIcon2 from '../assets/icons/icon_operation_2.svg'
import operationIcon3 from '../assets/icons/icon_operation_3.svg'
import operationIcon4 from '../assets/icons/icon_operation_4.svg'
import operationIcon5 from '../assets/icons/icon_operation_5.svg'
import operationIcon6 from '../assets/icons/icon_operation_6.svg'
import operationIcon7 from '../assets/icons/icon_operation_7.svg'
import operationIcon8 from '../assets/icons/icon_operation_8.svg'
import operationIcon9 from '../assets/icons/icon_operation_9.svg'

const MENU_MIN_HEIHGT = 150
const MENU_WIDTH = 200
const ERROR_LIMIT = 5
const DEFAULT_CELL_COLORS = ['white', 'red', 'yellow', 'blue']
const DEFAULT_COLOR_SUBTITLE = 'Background Colors'

const MENU_ITEMS_DEFAULT = {
  insertColumnRight: {
    text: 'Insert column right',
    iconSrc: operationIcon1,
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndex = getColToolCellIndexByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return Math.abs(cellRect.x + cellRect.width - boundary.x1) <= ERROR_LIMIT
        },
        this.quill.root.parentNode
      )

      const newColumn = tableContainer.insertColumn(
        this.boundary,
        colIndex,
        true,
        this.quill.root.parentNode)

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
    iconSrc: operationIcon2,
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndex = getColToolCellIndexByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return Math.abs(cellRect.x - boundary.x) <= ERROR_LIMIT
        },
        this.quill.root.parentNode
      )

      const newColumn = tableContainer.insertColumn(
        this.boundary,
        colIndex,
        false,
        this.quill.root.parentNode)

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
    iconSrc: operationIcon3,
    handler () {
      const tableContainer = Quill.find(this.table)
      const affectedCells = tableContainer.insertRow(
        this.boundary,
        false,
        this.quill.root.parentNode
      )
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
    iconSrc: operationIcon4,
    handler () {
      const tableContainer = Quill.find(this.table)
      const affectedCells = tableContainer.insertRow(
        this.boundary,
        true,
        this.quill.root.parentNode
      )
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

  mergeCells: {
    text: 'Merge selected cells',
    iconSrc: operationIcon5,
    handler () {
      const tableContainer = Quill.find(this.table)
      // compute merged Cell rowspan, equal to length of selected rows
      const rowspan = tableContainer.rows().reduce((sum, row) => {
        let rowRect  = getRelativeRect(
          row.domNode.getBoundingClientRect(),
          this.quill.root.parentNode
        )
        if (
          rowRect.y > this.boundary.y - ERROR_LIMIT &&
          rowRect.y + rowRect.height < this.boundary.y + this.boundary.height + ERROR_LIMIT
        ) {
          sum += 1
        }
        return sum
      }, 0)

      // compute merged cell colspan, equal to length of selected cols
      const colspan = this.columnToolCells.reduce((sum, cell) => {
        let cellRect = getRelativeRect(
          cell.getBoundingClientRect(),
          this.quill.root.parentNode
        )
        if (
          cellRect.x > this.boundary.x - ERROR_LIMIT &&
          cellRect.x + cellRect.width < this.boundary.x + this.boundary.width + ERROR_LIMIT
        ) {
          sum += 1
        }
        return sum
      }, 0)

      const mergedCell = tableContainer.mergeCells(
        this.boundary,
        this.selectedTds,
        rowspan,
        colspan,
        this.quill.root.parentNode
      )
      this.quill.update(Quill.sources.USER)
      this.tableSelection.setSelection(
        mergedCell.domNode.getBoundingClientRect(),
        mergedCell.domNode.getBoundingClientRect()
      )
    }
  },

  unmergeCells: {
    text: 'Unmerge cells',
    iconSrc: operationIcon6,
    handler () {
      const tableContainer = Quill.find(this.table)
      tableContainer.unmergeCells(
        this.selectedTds,
        this.quill.root.parentNode
      )
      this.quill.update(Quill.sources.USER)
      this.tableSelection.clearSelection()
    }
  },

  deleteColumn: {
    text: 'Delete selected columns',
    iconSrc: operationIcon7,
    handler () {
      const tableContainer = Quill.find(this.table)
      let colIndexes = getColToolCellIndexesByBoundary(
        this.columnToolCells,
        this.boundary,
        (cellRect, boundary) => {
          return cellRect.x + ERROR_LIMIT > boundary.x &&
            cellRect.x + cellRect.width - ERROR_LIMIT < boundary.x1
        },
        this.quill.root.parentNode
      )

      let isDeleteTable = tableContainer.deleteColumns(
        this.boundary,
        colIndexes,
        this.quill.root.parentNode
      )
      if (!isDeleteTable) {
        this.tableColumnTool.updateToolCells()
        this.quill.update(Quill.sources.USER)
        this.tableSelection.clearSelection()
      }
    }
  },

  deleteRow: {
    text: 'Delete selected rows',
    iconSrc: operationIcon8,
    handler () {
      const tableContainer = Quill.find(this.table)
      tableContainer.deleteRow(
        this.boundary,
        this.quill.root.parentNode
      )
      this.quill.update(Quill.sources.USER)
      this.tableSelection.clearSelection()
    }
  },

  deleteTable: {
    text: 'Delete table',
    iconSrc: operationIcon9,
    handler () {
      const betterTableModule = this.quill.getModule('better-table')
      const tableContainer = Quill.find(this.table)
      betterTableModule.hideTableTools()
      tableContainer.remove()
      this.quill.update(Quill.sources.USER)
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
    this.destroyHandler = this.destroy.bind(this)
    this.columnToolCells = this.tableColumnTool.colToolCells()
    this.colorSubTitle = options.color && options.color.text ? options.color.text : DEFAULT_COLOR_SUBTITLE
    this.cellColors = options.color && options.color.colors ? options.color.colors : DEFAULT_CELL_COLORS

    this.menuInitial(params)
    this.mount()
    document.addEventListener("click", this.destroyHandler, false)
  }

  mount () {
    document.body.appendChild(this.domNode)
  }

  destroy () {
    this.domNode.remove()
    document.removeEventListener("click", this.destroyHandler, false)
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
        this.domNode.appendChild(
          this.menuItemCreator(
            Object.assign({}, MENU_ITEMS_DEFAULT[name], this.menuItems[name])
          )
        )

        if (['insertRowDown', 'unmergeCells'].indexOf(name) > -1) {
          this.domNode.appendChild(
            dividingCreator()
          )
        }
      }
    }

    // if colors option is false, disabled bg color
    if (this.options.color && this.options.color !== false) {
      this.domNode.appendChild(
        dividingCreator()
      )
      this.domNode.appendChild(
        subTitleCreator(this.colorSubTitle)
      )
      this.domNode.appendChild(this.colorsItemCreator(this.cellColors))
    }

    // create dividing line
    function dividingCreator () {
      const dividing = document.createElement('div')
      dividing.classList.add('qlbt-operation-menu-dividing')
      return dividing
    }

    // create subtitle for menu
    function subTitleCreator (title) {
      const subTitle = document.createElement('div')
      subTitle.classList.add('qlbt-operation-menu-subtitle')
      subTitle.innerText = title
      return subTitle
    }
  }

  colorsItemCreator (colors) {
    const self = this
    const node = document.createElement('div')
    node.classList.add('qlbt-operation-color-picker')

    colors.forEach(color => {
      let colorBox = colorBoxCreator(color)
      node.appendChild(colorBox)
    })

    function colorBoxCreator (color) {
      const box = document.createElement('div')
      box.classList.add('qlbt-operation-color-picker-item')
      box.setAttribute('data-color', color)
      box.style.backgroundColor = color

      box.addEventListener('click', function () {
        const selectedTds = self.tableSelection.selectedTds
        if (selectedTds && selectedTds.length > 0) {
          selectedTds.forEach(tableCell => {
            tableCell.format('cell-bg', color)
          })
        }
      }, false)

      return box
    }

    return node
  }

  menuItemCreator ({ text, iconSrc, handler }) {
    const node = document.createElement('div')
    node.classList.add('qlbt-operation-menu-item')

    const iconSpan = document.createElement('span')
    iconSpan.classList.add('qlbt-operation-menu-icon')
    iconSpan.innerHTML = iconSrc

    const textSpan = document.createElement('span')
    textSpan.classList.add('qlbt-operation-menu-text')
    textSpan.innerText = text

    node.appendChild(iconSpan)
    node.appendChild(textSpan)
    node.addEventListener('click', handler.bind(this), false)
    return node
  }
}

function getColToolCellIndexByBoundary (cells, boundary, conditionFn, container) {
  return cells.reduce((findIndex, cell) => {
    let cellRect = getRelativeRect(cell.getBoundingClientRect(), container)
    if (conditionFn(cellRect, boundary)) {
      findIndex = cells.indexOf(cell)
    }
    return findIndex
  }, false)
}

function getColToolCellIndexesByBoundary (cells, boundary, conditionFn, container) {
  return cells.reduce((findIndexes, cell) => {
    let cellRect = getRelativeRect(
      cell.getBoundingClientRect(),
      container
    )
    if (conditionFn(cellRect, boundary)) {
      findIndexes.push(cells.indexOf(cell))
    }
    return findIndexes
  }, [])
}
