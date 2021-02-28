const Base = require('./base');
class NumberInput extends Base {
    constructor (identifiers, props = {}) {
        super(identifiers, props);

        this.guid = Lib.guid.generate();

        this.timer = null;

        this.props = {
            identifiers: identifiers || '',
            step: 1,
            interval: 100,
            default_value: 0,
            ...props,
        };

        return this.render();
    }

    set (value) {
        const input = document.getElementById(`number_input_${this.guid}`);
        input.value = value;
    }

    stopTimer () {
        clearInterval(this.timer);
        this.timer = null;
    }

    fireInput (mod) {
        const { step, interval } = this.props;
        mod = mod * step;
        this.checkValue(mod, true);
        this.timer = setInterval(() => {
            this.checkValue(mod, true);
        }, interval);
    }

    checkValue (mod = 0, set = false) {
        const {
            min,
            max,
            step,
            store_key,
            store_event,
        } = this.props;

        const input = document.getElementById(`number_input_${this.guid}`);
        let value = parseFloat(input.value) || 0;
        value += mod;

        if (typeof min === 'number' && value < min) value = min;
        if (typeof min === 'number' && value > max) value = max;

        if (set) {
            input.value = value.toFixed(this.getDecimalCount(step));
        }

        this.handleStore({
            store_key,
            store_event,
        }, value);
    }

    render () {
        const {
            identifiers,
            default_value,
            min,
            max,
            text,
        } = this.props;

        return Lib.dom.generate(
            [`div ${identifiers} .input_container`, [
                text && [`div .input_text HTML=${text}`],
                [`div .number_input_container`, [
                    [`div .number_input_button .arrow_left`, {
                        mousedown: (e) => this.fireInput(-1),
                        mouseend: (e) => this.stopTimer(),
                    }],
                    !isNaN(min) && [`div .number_input_info .number_input_min HTML=${min}`],
                    [`input #number_input_${this.guid} .number_input`, {
                        value: default_value,
                        onchange: (e) => this.checkValue(),
                    }],
                    !isNaN(max) && [`div .number_input_info .number_input_max HTML=${max}`],
                    [`div .number_input_button .arrow_right`, {
                        mousedown: (e) => this.fireInput(1),
                        mouseend: (e) => this.stopTimer(),
                    }],
                ]],
            ]],
        );
    }
}

module.exports = NumberInput;
