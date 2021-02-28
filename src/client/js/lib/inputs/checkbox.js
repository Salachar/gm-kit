const Base = require('./base');
class Checkbox extends Base {
    constructor (identifiers, props = {}) {
        super(identifiers, props);

        this.checkbox = null;

        this.props = {
            identifiers: identifiers || '',
            ...props,
        };

        return this.render();
    }

    get checked () {
        return this.checkbox.classList.contains('checked');
    }

    set checked (new_value) {
        if (new_value){
            this.checkbox.classList.add('checked');
        } else {
            this.checkbox.classList.remove('checked');
        }
    }

    render () {
        const {
            checked,
            identifiers,
            store_key,
            store_event,
            text,
            onchange,
        } = this.props;

        return Lib.dom.generate(['div .checkbox_container', [
            [`div ${identifiers} .checkbox`, {
                oncreate: (node) => {
                    this.checkbox = node;
                    if (checked) node.classList.add('checked');
                },
                click: (e) => {
                    const node = e.target;
                    let new_value = false;
                    if (!node.classList.contains('checked')) {
                        node.classList.add('checked');
                        new_value = true;
                    } else {
                        node.classList.remove('checked');
                    }

                    if (onchange) {
                        onchange(new_value);
                    }

                    if (store_key && store_event) {
                        this.handleStore({
                            store_key,
                            store_event,
                        }, new_value);
                    }
                }
            }],
            [`div .checkbox_label HTML=${text}`],
        ]], this);
    }
}

module.exports = Checkbox;
