# quill-better-table
A module for better table in Quill, more useful features are supported. There is a list of features below. Thanks [quilljs](https://quilljs.com/) for its awesome extensibility. Hope that quill-better-table could help you.

# Features
<ul>
  <li>Multiple lines in table cell ☑</li>
  <li>Add table column left/right ☑</li>
  <li>Add table row top/bottom ☑</li>
  <li>Remove table selected columns ☑</li>
  <li>Remove table selected rows ☑</li>
  <li>Selects multiple table cells ☑</li>
  <li>Merge/Unmerge table cells ☑</li>
  <li>Modify the width of column ☑</li>
  <li>Delete table ☑</li>
</ul>

# Requirements
[quilljs](https://github.com/quilljs/quill) v2.0.0-dev.3

Since I use webpack externals to bundle, you must expose `Quill` to window object, like load quill.js by script tag globally. Or you may need to fork this repo and build what you need.

# Installation
```
npm install quill-better-table
```

# Useage
Load quill and style dependencies
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.min.js" type="text/javascript"></script>
```
```
<link href="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.snow.min.css" rel="stylesheet">
<link href="unpkg.com/quill-better-table@1.0.0/dist/quill-better-table.css" rel="stylesheet">
```

ES6
```
import QuillBetterTable from 'quill-better-table'

Quill.register({
  'modules/better-table': QuillBetterTable
}, true)

window.onload = () => {
  const quill = new Quill('#editor-wrapper', {
    theme: 'snow',
    modules: {
      table: false,  // disable table module
      'better-table': {
        operationMenu: {
          items: {
            unmergeCells: {
              text: 'Another unmerge cells name'
            }
          }
        }
      },
      keyboard: {
        bindings: QuillBetterTable.keyboardBindings
      }
    }
  })

  document.body.querySelector('#insert-table')
    .onclick = () => {
      let tableModule = quill.getModule('better-table')
      tableModule.insertTable(3, 3)
    }
}
```

# Module methods
first, you can get quill-better-table module by `quill.getModule`
```
let module = quill.getModule('better-table')
```
## module.getTable(range = quill.getSelection())
get an array with TableContainer, TableRow, TableCell, offset through the given range.
```
module.getTable()  // current selection
module.getTable(range)
// [TableContainer, TableRow, TableCell, 0]
```

## module.insertTable(rows: Number, columns: Number)
insert table at current position
```
module.insertTable(3, 3)
```

# Module Options
quill-better-table only provide operation options now.
```
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    table: false,  // disable table module
    'better-table': {
      operationMenu: {
        items: {
          unmergeCells: {
            text: 'Another unmerge cells name'
          }
        }
      }
    },
    keyboard: {
      bindings: QuillBetterTable.keyboardBindings
    }
  }
})
```
## operationMenu
OperationMenu configures the operation list in right-click menu.

## operationMenu.items
operationMenu show all operations as default. `false` will remove the operation.
```
{
  operationKey: {
    text: 'foo'
  },

  operationKey: false
}
```
`operationKey` is the name of operation, there is a list below:
<ul>
  <li>insertColumnRight</li>
  <li>insertColumnLeft</li>
  <li>insertRowUp</li>
  <li>insertRowDown</li>
  <li>mergeCells</li>
  <li>unmergeCells</li>
  <li>deleteColumn</li>
  <li>deleteRow</li>
  <li>deleteTable</li>
</ul>

You may need to modify the menu text, `operationKey.text` will do that.

# License
[MIT License](https://rmm5t.mit-license.org/)
