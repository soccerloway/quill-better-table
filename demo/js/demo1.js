import Quill from 'quill'
import BetterTableModule from 'src/quill-better-table.js'
// import better-table styles file
import 'src/assets/quill-better-table.scss'

Quill.register({
  'modules/better-table': BetterTableModule
}, true)

window.onload = () => {
  const quill = new Quill('#editor-wrapper', {
    theme: 'snow',
    modules: {
      table: false,
      'better-table': true,
      keyboard: {
        bindings: BetterTableModule.keyboardBindings
      }
    }
  })

  document.body.querySelector('#insert-table')
    .onclick = () => {
      let tableModule = quill.getModule('better-table')
      tableModule.insertTable(3, 3)
    }
}
