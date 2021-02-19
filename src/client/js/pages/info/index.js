const Container = require('../base');
// const ContainerTemplate = require('./template');

const generators = require('./generators');

const {
    createElement,
} = Lib.dom;

const {
    numberInput,
} = Lib.input;

class InfoContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'info',
            // template: ContainerTemplate
        });

        this.amount_per_click = 5;

        this.results = [];

        this.el_buttons = document.getElementById('info_buttons');
        this.el_results = document.getElementById('info_results');

        this.initGenerators();
        this.setEvents();

        Store.register({
            "info_generator_amount_change": this.onAmountChange.bind(this),
        });
    }

    onAmountChange (data) {
        const new_amount = data.info_generator_amount;
        if (isNaN(new_amount)) new_amount = 1;
        this.amount_per_click = new_amount;
    }

    initGenerators () {
        for (let x in generators) {
            generators[x].init(this);
        }
    }

    addResult (result) {
        const node = createElement('div', 'result', {
            prependTo: this.el_results,
            events: {
                click: (e) => {
                    e.currentTarget.classList.add('marked');
                }
            }
        });

        createElement('span', 'result_key', {
            html: result.type,
            addTo: node
        });

        createElement('span', 'result_value', {
            html: result.value,
            addTo: node
        });

        this.results.push({
            type: result.type,
            value: result.value,
            node: node
        });
    }

    setEvents () {
        document.getElementById('clear_results_all').addEventListener('click', (e) => {
            this.el_results.innerHTML = '';
            this.results = [];
        });

        document.getElementById('clear_results').addEventListener('click', () => {
            this.results = this.results.filter((result) => {
                if (!result.node.classList.contains('marked')) {
                    result.node.remove();
                } else {
                    return result;
                }
            });
        });

        numberInput("info_click_amount", {
            min: 1,
            init: this.amount_per_click,
            store_key: "info_generator_amount",
            store_event: "info_generator_amount_change"
        });
    }

    template () {
        return `
            <div class="container_header">
                <div id="clear_results_all" class="button">Clear All Results</div>
                <div id="clear_results" class="button">Clear Unmarked Results</div>

                <div id="info_click_amount" class="number_input_container">
                    <div class="number_input_button arrow_left"></div>
                    <input type="text" class="number_input"></input>
                    <div class="number_input_button arrow_right"></div>
                </div>

            </div>

            <div class="container_body">
                <div id="info_buttons">

                </div>
                <div id="info_results"></div>
            </div>
        `;
    }
}

module.exports = InfoContainer;
