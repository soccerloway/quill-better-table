import Quill from "quill"
import { 
  TableCell,
  TableCellLine,
  CELL_IDENTITY_KEYS,
  CELL_ATTRIBUTES
} from './table'

const Block = Quill.import("blots/block")

class Header extends Block {
  static create (value) {
    if (typeof value === 'string') {
      value = { value }
    }

    const node = super.create(value.value)

    CELL_IDENTITY_KEYS.forEach(key => {
      if (value[key]) node.setAttribute(`data-${key}`, value[key])
    })

    CELL_ATTRIBUTES.forEach(key => {
      if (value[key]) node.setAttribute(`data-${key}`, value[key])
    })

    return node
  }

  static formats(domNode) {
    const formats = {}
    formats.value = this.tagName.indexOf(domNode.tagName) + 1

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).reduce((formats, attribute) => {
      if (domNode.hasAttribute(`data-${attribute}`)) {
        formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
      }
      return formats
    }, formats)
  }

  format (name, value) {
    const { row, cell, rowspan, colspan } = Header.formats(this.domNode)
    if (name === Header.blotName) {
      if (value) {
        super.format(name, {
          value,
          row, cell, rowspan, colspan
        })
      } else {
        if (row) {
          this.replaceWith(TableCellLine.blotName, {
            row,
            cell,
            rowspan,
            colspan
          })
        } else {
          super.format(name, value)
        }
      }
    } else {
      super.format(name, value)
    }
  }

  optimize(context) {
    const { row, rowspan, colspan } = Header.formats(this.domNode)

    if (
      row &&
      !(this.parent instanceof TableCell)
    ) {
      this.wrap(TableCell.blotName, {
        row,
        colspan,
        rowspan
      })
    }

    // ShadowBlot optimize
    this.enforceAllowedChildren();
    if (this.uiNode != null && this.uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore(this.uiNode, this.domNode.firstChild);
    }
    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        const child = this.scroll.create(this.statics.defaultChild.blotName);
        this.appendChild(child);
        // TODO double check if necessary
        // child.optimize(context);
      } else {
        this.remove();
      }
    }
    // Block optimize
    this.cache = {};
  }
}
Header.blotName = 'header';
Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export default Header;
