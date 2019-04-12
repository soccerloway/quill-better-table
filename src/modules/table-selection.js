import Quill from 'quill'
import { css } from '../utils'
import { TableCell } from '../formats/table'

const PRIMARY_COLOR = '#35A7ED'
const LINE_POSITIONS = ['left', 'right', 'top', 'bottom']
const ERROR_LIMIT = 2

export default class TableSelection {
  constructor (table, quill, options) {
    if (!table) return null
    this.table = table
    this.quill = quill
    this.options = options
    this.boundary = {}   // params for selected square
    this.selectedTds = []  // array for selected table-cells
    this.dragging = false
    this.selectingHandler = this.mouseDownHandler.bind(this)

    this.helpLinesInitial()
    this.quill.root.addEventListener('mousedown',
      this.selectingHandler,
      false)
  }

  helpLinesInitial () {
    let parent = this.quill.root.parentNode
    LINE_POSITIONS.forEach(direction => {
      this[direction] = document.createElement('div')
      this[direction].classList.add('qlbt-selection-line')
      css(this[direction], {
        position: 'absolute',
        display: 'none',
        'background-color': PRIMARY_COLOR
      })
      parent.appendChild(this[direction])
    })
  }

  mouseDownHandler (e) {
    if (e.button !== 0 || !e.target.closest(".quill-better-table")) return
    this.quill.root.addEventListener('mousemove', mouseMoveHandler, false)
    this.quill.root.addEventListener('mouseup', mouseUpHandler, false)

    const self = this
    const startTd = e.target.closest('td[data-row]')
    const startTdRect = startTd.getBoundingClientRect()
    this.dragging = true
    this.boundary = computeBoundaryFromRects(startTdRect, startTdRect)
    this.selectedTds = self.computeSelectedTds()
    this.repositionHelpLines()

    function mouseMoveHandler (e) {
      if (e.button !== 0 || !e.target.closest(".quill-better-table")) return
      const endTd = e.target.closest('td[data-row]')
      const endTdRect = endTd.getBoundingClientRect()
      self.boundary = computeBoundaryFromRects(startTdRect, endTdRect)
      self.selectedTds = self.computeSelectedTds()
      self.repositionHelpLines()

      // avoid select text in multiple table-cell
      if (startTd !== endTd) {
        self.quill.blur()
      }
    }

    function mouseUpHandler (e) {
      self.quill.root.removeEventListener('mousemove', mouseMoveHandler, false)
      self.quill.root.removeEventListener('mouseup', mouseUpHandler, false)
      self.dragging = false
    }
  }

  computeSelectedTds () {
    const tableContainer = Quill.find(this.table)
    const tableCells = tableContainer.descendants(TableCell)

    return tableCells.reduce((selectedCells, tableCell) => {
      let { x, y, width, height } = tableCell.domNode.getBoundingClientRect()
      let isCellIncluded = (
          (x + ERROR_LIMIT >= this.boundary.x && x + ERROR_LIMIT <= this.boundary.x1) ||
          (x - ERROR_LIMIT + width >= this.boundary.x && x - ERROR_LIMIT + width <= this.boundary.x1)
        ) && (
          (y + ERROR_LIMIT >= this.boundary.y && y + ERROR_LIMIT <= this.boundary.y1) ||
          (y - ERROR_LIMIT + height >= this.boundary.y && y - ERROR_LIMIT + height <= this.boundary.y1)
        )

      if (isCellIncluded) {
        this.boundary = computeBoundaryFromRects(this.boundary, { x, y, width, height })
        selectedCells.push(tableCell)
      }

      return selectedCells
    }, [])
  }

  repositionHelpLines () {
    const containerRect = this.quill.root.parentNode.getBoundingClientRect()
    css(this.left, {
      display: 'block',
      left: `${this.boundary.x - containerRect.x - 1}px`,
      top: `${this.boundary.y - containerRect.y}px`,
      height: `${this.boundary.y1 - this.boundary.y + 1}px`,
      width: '1px'
    })

    css(this.right, {
      display: 'block',
      left: `${this.boundary.x1 - containerRect.x}px`,
      top: `${this.boundary.y - containerRect.y}px`,
      height: `${this.boundary.y1 - this.boundary.y + 1}px`,
      width: '1px'
    })

    css(this.top, {
      display: 'block',
      left: `${this.boundary.x - containerRect.x - 1}px`,
      top: `${this.boundary.y - containerRect.y}px`,
      width: `${this.boundary.x1 - this.boundary.x + 1}px`,
      height: '1px'
    })

    css(this.bottom, {
      display: 'block',
      left: `${this.boundary.x - containerRect.x - 1}px`,
      top: `${this.boundary.y1 - containerRect.y + 1}px`,
      width: `${this.boundary.x1 - this.boundary.x + 1}px`,
      height: '1px'
    })
  }

  destroy () {
    LINE_POSITIONS.forEach(direction => {
      this[direction].remove()
      this[direction] = null
    })

    this.quill.root.removeEventListener('mousedown',
      this.selectingHandler,
    false)

    return null
  }

  setSelection (startRect, endRect) {
    this.boundary = computeBoundaryFromRects(startRect, endRect)
    this.selectedTds = this.computeSelectedTds()
    this.repositionHelpLines()
  }

  clearSelection () {
    this.boundary = {}
    this.selectedTds = []
    LINE_POSITIONS.forEach(direction => {
      css(this[direction], {
        display: 'none'
      })
    })
  }
}

function computeBoundaryFromRects (startRect, endRect) {
  let x = Math.min(
    startRect.x,
    endRect.x,
    startRect.x + startRect.width - 1,
    endRect.x + endRect.width - 1
  )

  let x1 = Math.max(
    startRect.x,
    endRect.x,
    startRect.x + startRect.width - 1,
    endRect.x + endRect.width - 1
  )

  let y = Math.min(
    startRect.y,
    endRect.y,
    startRect.y + startRect.height - 1,
    endRect.y + endRect.height - 1
  )

  let y1 = Math.max(
    startRect.y,
    endRect.y,
    startRect.y + startRect.height - 1,
    endRect.y + endRect.height - 1
  )

  let width = x1 - x
  let height = y1 - y

  return { x, x1, y, y1, width, height }
}
