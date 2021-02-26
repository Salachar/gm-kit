const Lib = require('..');
const Base = require('./base');
class Checkbox extends Base {
    constructor (identifiers, props = {}) {
        super(identifiers, props);

        this.props = {
            identifiers: identifiers || '',
            ...props,
        };

        return this.render();
    }

    render () {
        const {
            identifiers,
            store_key,
            store_event,
            text,
        } = this.props;

        return Lib.dom.generate(['div .checkbox_container', [
            [`div ${identifiers} .checkbox`, {
                click: (e) => {
                    const node = e.target;
                    let new_value = false;
                    if (!node.classList.contains('checked')) {
                        node.classList.add('checked');
                        new_value = true;
                    } else {
                        node.classList.remove('checked');
                    }

                    this.handleStore({
                        store_key,
                        store_event,
                    }, new_value);
                }
            }],
            [`div .checkbox_label HTML=${text}`],
        ]]);
    }
}

module.exports = Checkbox;
