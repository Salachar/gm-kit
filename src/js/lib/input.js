const {
    createElement
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
            opts.handler(value);
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
    }
};

module.exports = InputHelpers;
