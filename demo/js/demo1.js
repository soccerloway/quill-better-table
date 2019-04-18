import QuillBetterTable from 'quill-better-table'
// import better-table styles file
import 'src/assets/quill-better-table.scss'

Quill.register({
  'modules/better-table': QuillBetterTable
}, true)

window.onload = () => {
  const quill = new Quill('#editor-wrapper', {
    theme: 'snow',
    modules: {
      table: false,
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
