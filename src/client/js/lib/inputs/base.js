class InputBase {
    constructor (identifiers = '', props = {}) {
        let id = null;
        identifiers.split(' ').forEach((identifier) => {
            if (identifier[0] === '#') {
                id = identifier.replace('#','');
            }
        });

        if (props.parent && id) {
            props.parent.refs = props.parent.refs || {};
            props.parent.refs[id] = this;
        }
    }

    getDecimalCount (number) {
        try {
            return number.toString().split('.')[1].split('').length;
        } catch (e) {
            return 0;
        }
    }

    handleStore (opts = {}, value) {
        const { store_key, store_event } = opts;
        if (!store_key && !store_event) return;
        if (store_key && !store_event) {
            store_key.split(' ').forEach((key) => {
                Store.set({
                    [key]: value
                });
            });
        }
        if (store_event && !store_key) {
            Store.fire(store_event);
        }
        if (store_event && store_key) {
            store_key.split(' ').forEach((key) => {
                Store.set({
                    [key]: value
                });
            });
            Store.fire(store_event, {
                [store_key.split(' ')[0]]: value
            });
        }
    }
}

module.exports = InputBase;
