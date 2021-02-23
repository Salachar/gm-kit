const {
    createElement,

} = require('./dom');

const InputHelpers = {
    // Single timer for all the inputs, nobody should be doing multiple
    // at once and this will help make sure only one is going
    timer: null,

    killTimer: function () {
        clearInterval(InputHelpers.timer);
        InputHelpers.timer = null;
    },

    killTimerListener: function (node) {
        node.addEventListener('mouseup', (e) => {
            InputHelpers.killTimer(InputHelpers.timer);
        });
        node.addEventListener('mouseleave', (e) => {
            InputHelpers.killTimer(InputHelpers.timer);
        });
    },

    getDecimalCount: function (number) {
        try {
            return number.toString().split('.')[1].split('').length;
        } catch (e) {
            return 0;
        }
    },

    setValue (node, value) {
        const input = node.getElementsByClassName('number_input')[0];
        input.value = value;
    },

    numberInput: function (node, opts = {}) {
        node = checkNode(node);

        node.classList.add('number_input_container');

        opts.step = opts.step || 1;
        opts.interval = (typeof opts.interval === 'number') ? opts.interval : 100;

        const left_arrow = createElement('div', 'number_input_button arrow_left', { addTo: node });
        const right_arrow = createElement('div', 'number_input_button arrow_right', { addTo: node });
        const input = createElement('input', 'number_input', { addTo: node });

        if (typeof opts.min === 'number') {
            createElement('div', 'number_input_info number_input_min', {
                html: opts.min,
                addTo: node
            });
        }
        if (typeof opts.max === 'number') {
            createElement('div', 'number_input_info number_input_max', {
                html: opts.max,
                addTo: node
            });
        }

        if (opts.init) {
            input.value = opts.init;
            if (opts.store_key) {
                Store.set({
                    [opts.store_key]: opts.init
                });
            }
        }

        left_arrow.addEventListener('mousedown', (e) => {
            fireInput(-1);
        });
        InputHelpers.killTimerListener(left_arrow);

        right_arrow.addEventListener('mousedown', (e) => {
            fireInput(1);
        });
        InputHelpers.killTimerListener(right_arrow);

        input.addEventListener('keyup', (e) => {
            checkValue(0, input.value, false);
        });
        input.addEventListener('change', (e) => {
            checkValue(0, input.value, false);
        });

        function fireInput (mod) {
            mod = mod * opts.step;
            checkValue(mod, null, true);
            InputHelpers.timer = setInterval(() => {
                checkValue(mod, null, true);
            }, opts.interval);
        }

        function checkValue (mod, new_value, set) {
            let value = parseFloat(input.value) || 0;
            value += mod;
            if (new_value) value = new_value;
            if (typeof opts.min === 'number' && value < opts.min) value = opts.min;
            if (typeof opts.min === 'number' && value > opts.max) value = opts.max;
            if (set) {
                input.value = value.toFixed(InputHelpers.getDecimalCount(opts.step));
            }

            handleStore(opts, value);
        }
    },

    arrowInput: function (node, opts = {}) {
        node = checkNode(node);

        opts.step = opts.step || 1;
        opts.interval = (typeof opts.interval === 'number') ? opts.interval : 100;

        node.classList.add('arrow_buttons');
        const left_arrow = createElement('div', 'arrow_button arrow_left', {addTo: node});
        const top_arrow = createElement('div', 'arrow_button arrow_top', {addTo: node});
        const right_arrow = createElement('div', 'arrow_button arrow_right', {addTo: node});
        const bottom_arrow = createElement('div', 'arrow_button arrow_bottom', {addTo: node});

        left_arrow.addEventListener('mousedown', (e) => {
            fireInput(-1, 0);
        });
        InputHelpers.killTimerListener(left_arrow);

        top_arrow.addEventListener('mousedown', (e) => {
            fireInput(0, -1);
        });
        InputHelpers.killTimerListener(top_arrow);

        right_arrow.addEventListener('mousedown', (e) => {
            fireInput(1, 0);
        });
        InputHelpers.killTimerListener(right_arrow);

        bottom_arrow.addEventListener('mousedown', (e) => {
            fireInput(0, 1);
        });
        InputHelpers.killTimerListener(bottom_arrow);

        function fireInput (x, y) {
            let offset = {
                x: x * opts.step,
                y: y * opts.step
            };
            handleValue(opts, offset)
        }
    },

    radioInput: function (node, opts = {}) {
        node = checkNode(node);
        node.classList.add('radio_input');

        const { options } = opts;

        options.forEach((option) => {
            let value = null;
            let label = null;
            if (typeof option === 'string') {
                value = option;
                label = option;
            } else {
                value = option.value;
                label = option.label || value;
            }

            const container = createElement('div', 'checkbox_container', {
                addTo: node
            });
            const checkbox = createElement('div', 'checkbox', {
                addTo: container,
                dataset: {
                    value: value
                }
            });
            createElement('div', 'checkbox_label', {
                html: label,
                addTo: container
            });

            checkbox.addEventListener('click', (e) => {
                const is_checked = checkbox.classList.contains('checked');
                [...node.getElementsByClassName('checkbox')].forEach((cb) => {
                    cb.classList.remove('checked');
                });

                let new_value = null;

                if (!is_checked) {
                    checkbox.classList.add('checked');
                    new_value = checkbox.dataset.value;
                }

                handleValue(opts, new_value);
            });
        });
    },

    checkboxInput (node, opts = {}) {
        node = checkNode(node);

        node.addEventListener('click', (e) => {
            let new_value = false;
            if (!node.classList.contains('checked')) {
                node.classList.add('checked');
                new_value = true;
            } else {
                node.classList.remove('checked');
            }

            handleStore(opts, new_value);

            // if (opts.store) {
            //     (opts.store.keys || []).forEach((key) => {
            //         Store.set({
            //             [key]: new_value
            //         });
            //     });
            //     (opts.store.events || []).forEach((event) => {
            //         Store.fire(event);
            //     })
            // }
        });
    },

    deselect (node) {
        node = checkNode(node);

        for (let d in node.dataset) {
            if (d.indexOf('store_key') !== -1) {
                Store.set({
                    [node.dataset[d]]: null
                });
            }
        }
        if (node.classList.contains('radio_input')) {
            [...node.getElementsByClassName('checkbox')].forEach((cb) => {
                cb.classList.remove('checked');
            });
        }
    },

    handleStore: function (opts = {}, value) {
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
    },
};

function checkNode (node) {
    if (typeof node === 'string') {
        return document.getElementById(node);
    }
    return node;
}

function handleValue (opts, value) {
    const handler = opts.handler || function(){};
    handler(value);
    handleStore(opts, value);
    if (typeof opts.interval === 'number') {
        InputHelpers.timer = setInterval(() => {
            handler(value);
            handleStore(opts, value);
        }, opts.interval);
    }
}

function handleStore (opts = {}, value) {
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

module.exports = InputHelpers;
