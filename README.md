# quill-better-table
A module for better table in Quill, more useful features are supported. There is a list of features below. Thanks [quilljs](https://quilljs.com/) for its awesome extensibility. Hope that quill-better-table could help you.

# Online Demo
[quill-better-table Codepen Demo](https://codepen.io/soccerloway/pen/WWJowj)

# Updated
<ul>
  <li>
    <p>Replace TableCellLine.tagName from `DIV` to `P`. Using `DIV` to implement TableCellLine led a copy/paste issue: [#50](https://github.com/soccerloway/quill-better-table/issues/50). There are many more similar situations. When the user pastes the DIV tag into the editor, the DIV will be treated as a TableCellLine.</p>
  </li>
</ul>

# Features
Clicking on tables in quill editor will initialize the tools for table, all features are based on it.

<ul>
  <li>
    <h3>Multiple lines in table cell</h3>
    <p>Press Enter to add new lines in the table cell now.</p>
  </li>
  <li>
    <h3>Add table column left/right</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
  <li>
    <h3>Add table row top/bottom</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
  <li>
    <h3>Remove selected table columns</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
  <li>
    <h3>Remove selected table rows</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
  <li>
    <h3>Selects multiple table cells</h3>
    <p>Dragging over the table cells could select the tableCells surrounded by the highlight borders.</p>
  </li>
  <li>
    <h3>Merge/Unmerge table cells</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
  <li>
    <h3>Resize the width of column</h3>
    <p>Dragging lines between the top tool for columns could resize width of columns.</p>
  </li>
  <li>
    <h3>Delete table</h3>
    <p>Right-click on table to open context menu, you can see the button.</p>
  </li>
</ul>

# Requirements
[quilljs](https://github.com/quilljs/quill) v2.0.0-dev.3

Since I use webpack externals to bundle, you must expose `Quill` to window object, like load quill.js by script tag globally. Or you may need to fork this repo and build what you need.

# Installation
```
npm install quill-better-table
```

# Usage
Load quill and style dependencies
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.min.js" type="text/javascript"></script>
```
```
<link href="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.snow.min.css" rel="stylesheet">
<link href="https://unpkg.com/quill-better-table@1.2.8/dist/quill-better-table.css" rel="stylesheet">
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
        },
        color: {
          colors: ['#fff', 'red', 'rgb(0, 0, 0)'],  // colors in operationMenu
          text: 'Background Colors'  // subtitle
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

## operationMenu.color
Background colors is optional, the default is hidden. If you need this feature, use this configure.
```
{
  colors: ['#fff', 'red', 'rgb(0, 0, 0)'],  // colors you need in operationMenu, ['white', 'red', 'yellow', 'blue'] as default
  text: 'Background Colors'  // subtitle, 'Background Colors' as default
} 
```

# Community
Send me an email(<a href="mailto: lw54760187@hotmail.com">lw54760187@hotmail.com</a>) or Contribute on [Issues](https://github.com/soccerloway/quill-better-table/issues), I glad to hear your suggestion.

# License
[MIT License](https://rmm5t.mit-license.org/)
