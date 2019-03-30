import Quill from "quill"

const Break = Quill.import("blots/break")
const Block = Quill.import("blots/block")
const Container = Quill.import("blots/container")

const COL_ATTRIBUTES = ["width"]
const COL_DEFAULT = {
  width: 150
}
const CELL_IDENTITY_KEYS = ["row", "cell"]
const CELL_ATTRIBUTES = ["rowspan", "colspan"]
const CELL_DEFAULT = {
  rowspan: 1,
  colspan: 1
}

class TableCellLine extends Block {
  static create(value) {
    const node = super.create(value)

    CELL_IDENTITY_KEYS.forEach(key => {
      let identityMaker = `${key}Id`
      node.setAttribute(`data-${key}`, value[key] || identityMaker())
    })

    CELL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`data-${attrName}`, value[attrName] || CELL_DEFAULT[attrName])
    })

    return node
  }

  static formats(domNode) {
    const formats = {}

    CELL_IDENTITY_KEYS.forEach(key => {
      if (domNode.hasAttribute(`data-${key}`)) {
        formats[key] = domNode.getAttribute(`data-${key}`) || undefined
      }
    })

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(`data-${attribute}`)) {
        formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
      }
      return formats
    }, formats)
  }

  format(name, value) {
    if (CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(`data-${name}`, value)
      } else {
        this.domNode.removeAttribute(`data-${name}`)
      }
    } else {
      super.format(name, value)
    }
  }

  optimize(context) {
    // cover shadowBlot's wrap call, pass params parentBlot initialize
    // needed
    const rowId = this.domNode.getAttribute('data-row')
    const rowspan = this.domNode.getAttribute('data-rowspan')
    const colspan = parseInt(this.domNode.getAttribute('data-colspan'), 10)
    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId,
        colspan,
        rowspan
      })
    }
    super.optimize(context)
  }

  tableCell() {
    return this.parent
  }
}
TableCellLine.blotName = "table-cell-line"
TableCellLine.ClassName = "table-cell-line"
TableCellLine.tagName = "DIV"

class TableCell extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats()["table-cell-line"]
      const thisTail = this.children.tail.formats()["table-cell-line"]
      const nextHead = this.next.children.head.formats()["table-cell-line"]
      const nextTail = this.next.children.tail.formats()["table-cell-line"]
      return (
        thisHead.cell === thisTail.cell &&
        thisHead.cell === nextHead.cell &&
        thisHead.cell === nextTail.cell
      )
    }
    return false
  }

  static create(value) {
    const node = super.create(value)
    node.setAttribute("data-row", value.row)

    CELL_ATTRIBUTES.forEach(attrName => {
      if (value[attrName]) {
        node.setAttribute(attrName, value[attrName])
      }
    })

    return node
  }

  static formats(domNode) {
    const formats = {}

    if (domNode.hasAttribute("data-row")) {
      formats["row"] = domNode.getAttribute("data-row")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  cellOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  formats() {
    const formats = {}

    if (this.domNode.hasAttribute("data-row")) {
      formats["row"] = this.domNode.getAttribute("data-row")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (this.domNode.hasAttribute(attribute)) {
        formats[attribute] = this.domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  toggleAttribute (name, value) {
    if (value) {
      this.domNode.setAttribute(name, value)
    } else {
      this.domNode.removeAttribute(name)
    }
  }

  formatChildren (name, value) {
    this.children.forEach(child => {
      child.format(name, value)
    })
  }

  format(name, value) {
    if (CELL_ATTRIBUTES.indexOf(name) > -1) {
      this.toggleAttribute(name, value)
      this.formatChildren(name, value)
    } else if (['row'].indexOf(name) > -1) {
      this.toggleAttribute(`data-${name}`, value)
      this.formatChildren(name, value)
    } else {
      super.format(name, value)
    }
  }

  optimize(context) {
    const rowId = this.domNode.getAttribute("data-row")

    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId
      })
    }
    super.optimize(context)
  }

  row() {
    return this.parent
  }

  rowOffset() {
    if (this.row()) {
      return this.row().rowOffset()
    }
    return -1
  }

  table() {
    return this.row() && this.row().table()
  }
}
TableCell.blotName = "table"
TableCell.tagName = "TD"

class TableRow extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats()
      const thisTail = this.children.tail.formats()
      const nextHead = this.next.children.head.formats()
      const nextTail = this.next.children.tail.formats()

      return (
        thisHead.row === thisTail.row &&
        thisHead.row === nextHead.row &&
        thisHead.row === nextTail.row
      )
    }
    return false
  }

  static create(value) {
    const node = super.create(value)
    node.setAttribute("data-row", value.row)
    return node
  }

  formats() {
    return ["row"].reduce((formats, attrName) => {
      if (this.domNode.hasAttribute(`data-${attrName}`)) {
        formats[attrName] = this.domNode.getAttribute(`data-${attrName}`)
      }
      return formats
    }, {})
  }

  rowOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  table() {
    return this.parent && this.parent.parent
  }
}
TableRow.blotName = "table-row"
TableRow.tagName = "TR"

class TableBody extends Container {}
TableBody.blotName = "table-body"
TableBody.tagName = "TBODY"

class TableCol extends Block {
  static create (value) {
    let node = super.create(value)
    COL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`${attrName}`, value[attrName] || COL_DEFAULT[attrName])
    })
    return node
  }

  static formats(domNode) {
    return COL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(`${attribute}`)) {
        formats[attribute] =
          domNode.getAttribute(`${attribute}`) || undefined
      }
      return formats
    }, {})
  }

  format(name, value) {
    if (COL_ATTRIBUTES.indexOf(name) > -1) {
      this.domNode.setAttribute(`${name}`, value || COL_DEFAULT[name])
    } else {
      super.format(name, value)
    }
  }
}
TableCol.blotName = "table-col"
TableCol.tagName = "col"

class TableColGroup extends Container {}
TableColGroup.blotName = "table-col-group"
TableColGroup.tagName = "colgroup"

class TableContainer extends Container {
  static create() {
    let node = super.create()
    return node
  }

  constructor (scroll, domNode) {
    super(scroll, domNode)
    this.updateTableWidth()
  }

  updateTableWidth () {
    setTimeout(() => {
      const colGroup = this.colGroup()
      if (!colGroup) return
      const tableWidth = colGroup.children.reduce((sumWidth, col) => {
        sumWidth = sumWidth + parseInt(col.formats()[TableCol.blotName].width, 10)
        return sumWidth
      }, 0)
      this.domNode.style.width = `${tableWidth}px`
    }, 0)
  }

  cells(column) {
    return this.rows().map(row => row.children.at(column))
  }

  colGroup () {
    return this.children.tail
  }

  deleteColumn(compareRect) {
    const [body] = this.descendant(TableBody)
    if (body == null || body.children.head == null) return

    const ERROR_LIMIT = 5
    const tableCells = this.descendants(TableCell)
    const removedCells = []
    const modifiedCells = []

    tableCells.forEach(cell => {
      const cellRect = cell.domNode.getBoundingClientRect()
      const compareLeft = compareRect.x
      const compareRight = compareRect.x + compareRect.width
      const cellLeft = cellRect.x
      const cellRight = cellRect.x + cellRect.width

      if (
        cellLeft > compareLeft - ERROR_LIMIT &&
        cellRight < compareRight + ERROR_LIMIT
      ) {
        removedCells.push(cell)
      } else if (
        cellLeft < compareLeft + ERROR_LIMIT &&
        cellRight > compareRight - ERROR_LIMIT
      ) {
        modifiedCells.push(cell)
      }
    })

    if (removedCells.length === tableCells.length) {
      this.tableDestroy()
      return
    }

    removedCells.forEach(cell => {
      cell.remove()
    })

    modifiedCells.forEach(cell => {
      const cellColspan = parseInt(cell.formats().colspan, 10)
      const cellWidth = parseInt(cell.formats().width, 10)
      cell.format('colspan', cellColspan - 1)
      cell.format('width', cellWidth - CELL_DEFAULT.width)
    })

    this.updateTableWidth()
  }

  deleteRow(compareRect) {
    const [body] = this.descendant(TableBody)
    if (body == null || body.children.head == null) return

    const ERROR_LIMIT = 5
    const tableCells = this.descendants(TableCell)
    const removedCells = []  // 将被删掉的单元格
    const modifiedCells = [] // 将被修改属性的单元格
    const fallCells = []     // 将从上一行落到下一行的单元格

    tableCells.forEach(cell => {
      const cellRect = cell.domNode.getBoundingClientRect()
      const compareTop = compareRect.y
      const compareBottom = compareRect.y + compareRect.height
      const cellTop = cellRect.y
      const cellBottom = cellRect.y + cellRect.height

      if (
        cellTop > compareTop - ERROR_LIMIT &&
        cellBottom < compareBottom + ERROR_LIMIT
      ) {
        removedCells.push(cell)
      } else if (
        cellTop < compareTop + ERROR_LIMIT &&
        cellBottom > compareBottom - ERROR_LIMIT
      ) {
        modifiedCells.push(cell)

        if (Math.abs(cellTop - compareTop) < ERROR_LIMIT) {
          fallCells.push(cell)
        }
      }
    })

    if (removedCells.length === tableCells.length) {
      this.tableDestroy()
      return
    }

    // 需要根据当前cell位置处理，必须放在删除单元格等改变布局的逻辑之前
    fallCells.forEach(cell => {
      const cellRect = cell.domNode.getBoundingClientRect()
      const cellRight = cellRect.x + cellRect.width
      const nextRow = cell.parent.next
      const cellsInNextRow = nextRow.children

      const refCell = cellsInNextRow.reduce((ref, compareCell) => {
        const compareRect = compareCell.domNode.getBoundingClientRect()
        if (Math.abs(cellRight - compareRect.x) < ERROR_LIMIT) {
          ref = compareCell
        }
        return ref
      }, null)

      nextRow.insertBefore(cell, refCell)
      cell.format('row', nextRow.formats().row)
    })

    removedCells.forEach(cell => {
      cell.remove()
    })

    modifiedCells.forEach(cell => {
      const cellRowspan = parseInt(cell.formats().rowspan, 10)
      cell.format("rowspan", cellRowspan - 1)
    })
  }

  tableDestroy() {
    const quill = Quill.find(this.scroll.domNode.parentNode)
    const tableToolModule = quill.getModule("table-tools")
    const offset = this.offset()
    tableToolModule.hide()
    this.remove()
    quill.update(Quill.sources.USER)
    quill.setSelection(offset, Quill.sources.SILENT)
  }

  insertCell(tdDom, row) {
    const id = cellId()
    const tableRow = Quill.find(row)
    const rId = tableRow.formats().row
    const ref = tdDom ? Quill.find(tdDom) : null
    const tableCell = this.scroll.create(
      TableCell.blotName,
      Object.assign({}, CELL_DEFAULT, {
        row: rId,
        rowspan: 1,
        width: 150
      })
    )
    const cellLine = this.scroll.create(TableCellLine.blotName, {
      row: rId,
      cell: id,
      rowspan: 1
    })
    tableCell.appendChild(cellLine)

    if (ref) {
      tableRow.insertBefore(tableCell, ref)
    } else {
      tableRow.appendChild(tableCell)
    }
  }

  insertColumn(compareRect) {
    const [body] = this.descendant(TableBody)
    if (body == null || body.children.head == null) return

    const ERROR_LIMIT = 5
    const tableCells = this.descendants(TableCell)
    const affectedCells = tableCells.reduce((cells, cell) => {
      const cellRect = cell.domNode.getBoundingClientRect()
      const compareRight = compareRect.x + compareRect.width
      const cellLeft = cellRect.x
      const cellRight = cellRect.x + cellRect.width
      const cellFormats = cell.formats()

      if (Math.abs(cellRight - compareRight) < ERROR_LIMIT) {
        // 列工具单元的右边线与单元格右边线重合，此时在该单元格右边新增一格
        const id = cellId()
        const tableRow = cell.parent
        const rId = tableRow.formats().row
        const ref = cell.next
        const tableCell = this.scroll.create(
          TableCell.blotName,
          Object.assign({}, CELL_DEFAULT, {
            row: rId,
            rowspan: cellFormats.rowspan
          })
        )
        const cellLine = this.scroll.create(TableCellLine.blotName, {
          row: rId,
          cell: id,
          rowspan: cellFormats.rowspan
        })
        tableCell.appendChild(cellLine)

        if (ref) {
          tableRow.insertBefore(tableCell, ref)
        } else {
          tableRow.appendChild(tableCell)
        }

        cells.push(tableCell)
      } else if (
        compareRight - cellLeft > ERROR_LIMIT &&
        compareRight - cellRight < -ERROR_LIMIT
      ) {
        // 列工具单元的右边线位于单元格之中
        cell.format('colspan', parseInt(cellFormats.colspan, 10) + 1)
        cell.format('width', parseInt(cellFormats.width, 10) + CELL_DEFAULT.width)
        cells.push(cell)
      }
      return cells
    }, [])

    this.updateTableWidth()
    return affectedCells
  }

  insertRow(compareRect, rowIndex) {
    const [body] = this.descendant(TableBody)
    if (body == null || body.children.head == null) return

    const ERROR_LIMIT = 5
    const tableCells = this.descendants(TableCell)
    const rId = rowId()
    const newRow = this.scroll.create(TableRow.blotName, {
      row: rId
    })
    let addBelowCells = []
    let modifiedCells = []
    let affectedCells = []

    tableCells.forEach(cell => {
      const cellRect = cell.domNode.getBoundingClientRect()
      const compareBottom = compareRect.y + compareRect.height
      const cellTop = cellRect.y
      const cellBottom = cellRect.y + cellRect.height

      if (Math.abs(cellBottom - compareBottom) < ERROR_LIMIT) {
        // 行工具单元的下边线与单元格下边线重合，此时在该单元格下边新增一格
        addBelowCells.push(cell)
      } else if (
        compareBottom - cellTop > ERROR_LIMIT &&
        compareBottom - cellBottom < -ERROR_LIMIT
      ) {
        // 行工具单元的下边线位于单元格之中
        modifiedCells.push(cell)
      }
    })

    // 根据单元格Rect.x排序，防止异形表格插入新单元格顺序错误的问题
    const sortFunc = (cellA, cellB) => {
      let x1 = cellA.domNode.getBoundingClientRect().x
      let x2 = cellB.domNode.getBoundingClientRect().x
      return x1 - x2
    }
    addBelowCells.sort(sortFunc)

    addBelowCells.forEach(cell => {
      const cId = cellId()
      const cellFormats = cell.formats()

      const tableCell = this.scroll.create(TableCell.blotName, Object.assign(
        {}, CELL_DEFAULT, { row: rId, colspan: cellFormats.colspan, width: cellFormats.width }
      ))
      const cellLine = this.scroll.create(TableCellLine.blotName, {
        row: rId,
        cell: cId,
        colspan: cellFormats.colspan,
        width: cellFormats.width
      })
      const empty = this.scroll.create(Break.blotName)
      cellLine.appendChild(empty)
      tableCell.appendChild(cellLine)
      newRow.appendChild(tableCell)
      affectedCells.push(tableCell)
    })

    modifiedCells.forEach(cell => {
      const cellRowspan = parseInt(cell.formats().rowspan, 10)
      cell.format("rowspan", cellRowspan + 1)
      affectedCells.push(cell)
    })

    const ref = body.children.at(rowIndex).next
    body.insertBefore(newRow, ref)

    // affectedCells根据rect.x排序
    affectedCells.sort(sortFunc)
    return affectedCells
  }

  rows() {
    const body = this.children.head
    if (body == null) return []
    return body.children.map(row => row)
  }
}
TableContainer.blotName = "table-container"
TableContainer.className = "nb-editor-table"
TableContainer.tagName = "TABLE"

class TableViewWrapper extends Container {
  constructor (scroll, domNode) {
    super(scroll, domNode)
  }
}
TableViewWrapper.blotName = "table-view"
TableViewWrapper.className = "nb-table-view-wrapper"
TableViewWrapper.tagName = "DIV"

TableViewWrapper.allowedChildren = [TableContainer]
TableContainer.requiredContainer = TableViewWrapper

TableContainer.allowedChildren = [TableBody, TableColGroup]
TableBody.requiredContainer = TableContainer

TableBody.allowedChildren = [TableRow]
TableRow.requiredContainer = TableBody

TableRow.allowedChildren = [TableCell]
TableCell.requiredContainer = TableRow

TableCell.allowedChildren = [TableCellLine]
TableCellLine.requiredContainer = TableCell

TableColGroup.allowedChildren = [TableCol]
TableColGroup.requiredContainer = TableContainer

TableCol.requiredContainer = TableColGroup


function rowId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 6)
  return `row-${id}`
}

function cellId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 6)
  return `cell-${id}`
}

export {
  TableCol,
  TableColGroup,
  TableCellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableViewWrapper,
  rowId,
  cellId
}

