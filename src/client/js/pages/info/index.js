const Button = require('../../lib/inputs/button');
const NumberInput = require('../../lib/inputs/numberInput');

const generators = require('./generators');

const Container = require('../base');
class InfoContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'info',
        });

        this.amount_per_click = 5;

        this.results = [];

        this.el_buttons = null;
        this.el_results = null;

        Store.register({
            "info_generator_amount_change": this.onAmountChange.bind(this),
        });

        this.render();
    }

    onAmountChange (data) {
        const new_amount = data.info_generator_amount;
        if (isNaN(new_amount)) new_amount = 1;
        this.amount_per_click = new_amount;
    }

    addResult (result) {
        Lib.dom.generate(['div .result', {
            oncreate: (node) => {
                this.results.push({
                    type: result.type,
                    value: result.value,
                    node: node
                });
            },
            click: (e) => e.currentTarget.classList.add('marked'),
        }, [
            [`span .result_key HTML=${result.type}`],
            [`span .result_value HTML=${result.value}`],
        ]], null, this.el_results);
    }

    renderNameButtons () {
        const name_buttons = [];

        Object.keys(generators).forEach((generator_key) => {
            const generator = generators[generator_key];
            name_buttons.push(new Button('.info_button', {
                text: `Male ${generator.title}`,
                onclick: (e) => {
                    for (var i = 0; i < this.amount_per_click; ++i) {
                        this.addResult({
                            type: 'Male ' + generator.title,
                            value: generator.generate(generator.male)
                        });
                    }
                }
            }),);
            name_buttons.push(new Button('.info_button', {
                text: `Female ${generator.title}`,
                onclick: (e) => {
                    for (var i = 0; i < this.amount_per_click; ++i) {
                        this.addResult({
                            type: 'Female ' + generator.title,
                            value: generator.generate(generator.female)
                        });
                    }
                }
            }),);
        });

        return name_buttons;
    }

    render () {
        Lib.dom.generate(['div .page', [
            ['div .container_header', [
                new Button('#clear_results_all', {
                    text: 'Clear All Results',
                    onclick: (e) => {
                        this.el_results.innerHTML = '';
                        this.results = [];
                    }
                }),
                new Button('#clear_results', {
                    text: 'Clear Unmarked Results',
                    onclick: (e) => {
                        this.results = this.results.filter((result) => {
                            if (!result.node.classList.contains('marked')) {
                                result.node.remove();
                            } else {
                                return result;
                            }
                        });
                    }
                }),
                new NumberInput("#info_click_amount", {
                    min: 1,
                    init: this.amount_per_click,
                    store_key: "info_generator_amount",
                    store_event: "info_generator_amount_change"
                }),
            ]],
            ['div .container_body', [
                ['div #info_buttons', {
                    oncreate: (node) => {
                        this.el_buttons = node;
                    }
                }, [
                    ...this.renderNameButtons(),
                ]],
                ['div #info_results', {
                    oncreate: (node) => {
                        this.el_results = node;
                    }
                }],
            ]]
        ]], null, this.node);
    }
}

module.exports = InfoContainer;
