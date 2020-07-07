import Quill from 'quill';
import TablePicker from '../ui/table-picker';
import extend from 'extend';

const SnowTheme = Quill.import('themes/snow');

class BetterTableSnowTheme extends SnowTheme {
    constructor(quill, options) {
        super(quill, options);
    }

    buildPickers(selects, icons) {
        selects = Array.from(selects);
        let pickers = selects.map((select, index, selects) => {
            if (select.classList.contains('ql-better-table')) {
                selects.splice(index, 1);
                if (select.querySelector('option') == null) {
                    for (let r = 1; r <= 8; r++) {
                        for (let c = 1; c <= 10; c++) {
                            const option = document.createElement('option');
                            option.setAttribute('value', c + 'x' + r);
                            select.appendChild(option);
                        }
                    }
                }
                return new TablePicker(select, icons.table);
            }
        });
        super.buildPickers(selects, icons);
        this.pickers = extend([], this.pickers, pickers);
    }
}

export default BetterTableSnowTheme;