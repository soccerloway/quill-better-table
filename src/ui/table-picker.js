import Quill from 'quill';

const Picker = Quill.import('ui/picker');

class TablePicker extends Picker {
    constructor(select, label) {
        super(select);

        this.label.innerHTML = label;
        this.container.classList.add('ql-table-picker');
    }

    buildItem(option) {
        const item = super.buildItem(option);

        item.addEventListener('mouseover', () => {
            let value = item.getAttribute('data-value').split('x');
            let row = parseInt(value[1]);
            let column = parseInt(value[0]);
            let items = Array.from(this.container.querySelectorAll('.ql-picker-item'));
            let lastItem = this.container.querySelector('.ql-picker-item:last-child');
            value = lastItem.getAttribute('data-value').split('x');
            // let rows = parseInt(value[1]);
            let cols = parseInt(value[0]);

            items.forEach(i => {
                i.classList.remove('hover');
            });
            for (let r = 0; r < row; r++) {
                items.slice(r * cols, r * cols + column).forEach(i => {
                    i.classList.add('hover');
                });
            }
        });

        return item;
    }

    selectItem(item, trigger = false) {
        super.selectItem(item, trigger);

        if (item == null) return
        item.classList.remove('ql-selected');
        if (item.label) {
            item.label.removeAttribute('data-value');
            item.label.removeAttribute('data-label');
        }

        Array.from(this.container.querySelectorAll('.hover')).forEach(item => {
            item.classList.remove('hover');
        });
    }
}

export default TablePicker;