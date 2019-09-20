const {
    createElement,
    configureElement
} = require('./dom');
const {
    pixelData,
    line
} = require('./canvas');
const {
    rgb
} = require('./helpers');

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

    colorPicker: function (node, opts = {}) {
        const canvas = createElement('canvas', 'color_picker_canvas', {
            addTo: node
        });
        const context = canvas.getContext('2d');

        let crosshair = createElement('div', 'color_picker_crosshair', {
            addTo: node
        });

        let pixel_index = 0;

        canvas.width = node.clientWidth;
        canvas.height = node.clientHeight;

        const fidelity = 255 / (canvas.width / 6);

        // start with red
        let r = 255;
        let g = 0;
        let b = 0;
        // increase green to 255
        for (g; g <= 255; g += fidelity) { pixel_index += 1; drawLine();}
        // reduce red to 0
        for (r; r >= 0; r -= fidelity) { pixel_index += 1; drawLine();}
        // increase blue to 255
        for (b; b <= 255; b += fidelity) { pixel_index += 1; drawLine();}
        // reduce green to 0
        for (g; g >= 0; g -= fidelity) { pixel_index += 1; drawLine();}
        // increase red to 255
        for (r; r <= 255; r += fidelity) { pixel_index += 1; drawLine();}
        // reduce blue to 0
        for (b; b >= 0; b -= fidelity) { pixel_index += 1; drawLine();}

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const pos = {
                x: Math.round(e.clientX - rect.left),
                y: Math.round(e.clientY - rect.top)
            };

            configureElement(crosshair, {
                css: {
                    top: pos.y + 'px',
                    left: pos.x + 'px'
                }
            });

            const pixel_data = pixelData(context);
            const selected = pixel_data[pos.y][pos.x];
            const color = rgb(selected.r, selected.g, selected.b);
            if (opts.store_key) {
                Store.set({
                    [opts.store_key]: color
                });
            }
            if (opts.handler) {
                opts.handler(color);
            }
        });

        function drawLine () {
            line(context, {
                points: [{
                    x: pixel_index,
                    y: 0
                }, {
                    x: pixel_index,
                    y: canvas.height
                }],
                width: 1,
                color: rgb(r,g,b)
            });
        }
    },

    numberInput: function (node, opts = {}) {
        // <div class="number_input_container">
        //     <div class="number_input_button arrow_left"></div>
        //     <input type="text" class="number_input" value="50"></input>
        //     <div class="number_input_button arrow_right"></div>
        // </div>

        opts.step = opts.step || 1;
        opts.interval = (typeof opts.interval === 'number') ? opts.interval : 100;

        // Possible create all the necessary elements here, but for now
        // I'll just add what I need as go given the above template
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

        const left_arrow = node.getElementsByClassName('arrow_left')[0];
        const right_arrow = node.getElementsByClassName('arrow_right')[0];
        const input = node.getElementsByClassName('number_input')[0];

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
            if (opts.store_key) {
                Store.set({
                    [opts.store_key]: value
                });
            }
            if (opts.handler) {
                opts.handler(value);
            }
        }
    },

    arrowInput: function (node, opts = {}) {
        // <div class="arrow_buttons">
        //     <div class="arrow_button arrow_left"></div>
        //     <div class="arrow_button arrow_top"></div>
        //     <div class="arrow_button arrow_bottom"></div>
        //     <div class="arrow_button arrow_right"></div>
        // </div>

        opts.step = opts.step || 1;
        opts.interval = (typeof opts.interval === 'number') ? opts.interval : 100;

        const left_arrow = node.getElementsByClassName('arrow_left')[0];
        const top_arrow = node.getElementsByClassName('arrow_top')[0];
        const right_arrow = node.getElementsByClassName('arrow_right')[0];
        const bottom_arrow = node.getElementsByClassName('arrow_bottom')[0];

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
            opts.handler(offset);
            InputHelpers.timer = setInterval(() => {
                opts.handler(offset);
            }, opts.interval);
        }
    },

    radioInput: function (node, opts = {}) {
        // <div class="checkbox_container">
        //     <div class="checkbox"></div>
        //     <div class="checkbox_label"></div>
        // </div>

        const { options } = opts;
        const store = opts.store || {};

        const dataset = {};
        (store.keys || []).forEach((key, index) => {
            dataset['store_key_' + index] = key;
        });
        configureElement(node, {
            dataset: dataset
        });

        options.forEach((option) => {
            const value = option.value;
            const label = option.label || value;

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

                if (store) {
                    (store.keys || []).forEach((key) => {
                        Store.set({
                            [key]: new_value
                        });
                    });
                    (store.events || []).forEach((event) => {
                        Store.fire(event);
                    })
                }

                if (opts.handler) {
                    opts.handler(checkbox.dataset.value);
                }
            });
        });
    },

    checkboxInput (node, opts = {}) {
        node.addEventListener('click', (e) => {
            let new_value = false;
            if (!node.classList.contains('checked')) {
                node.classList.add('checked');
                new_value = true;
            } else {
                node.classList.remove('checked');
            }

            if (opts.store) {
                (opts.store.keys || []).forEach((key) => {
                    Store.set({
                        [key]: new_value
                    });
                });
                (opts.store.events || []).forEach((event) => {
                    Store.fire(event);
                })
            }
        });
    },

    deselect (node) {
        console.log(node);
        console.log(node.dataset);

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
};

module.exports = InputHelpers;
