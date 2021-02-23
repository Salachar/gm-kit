const Container = require('../base');

const { ctwo } = Lib.dom;

const generators = require('./generators');
const NumberInput = require('../../lib/inputs/numberInput');

class InfoContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'info',
            render: false,
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
        ctwo(this.el_results, ['div .result', {
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
        ]]);
    }

    renderNameButtons () {
        const name_buttons = [];

        Object.keys(generators).forEach((generator_key) => {
            const generator = generators[generator_key];
            name_buttons.push([`div .info_button .button HTML=Male ${generator.title}`, {
                click: (e) => {
                    for (var i = 0; i < this.amount_per_click; ++i) {
                        this.addResult({
                            type: 'Male ' + generator.title,
                            value: generator.generate(generator.male)
                        });
                    }
                }
            }]);
            name_buttons.push([`div .info_button .button HTML=Female ${generator.title}`, {
                click: (e) => {
                    for (var i = 0; i < this.amount_per_click; ++i) {
                        this.addResult({
                            type: 'Female ' + generator.title,
                            value: generator.generate(generator.female)
                        });
                    }
                }
            }]);
        });

        return name_buttons;
    }

    render () {
        ctwo(this.node, ['div .container_header', [
            ['div #clear_results_all .button HTML=Clear All Results', {
                click: (e) => {
                    this.el_results.innerHTML = '';
                    this.results = [];
                }
            }],
            ['div #clear_results .button HTML=Clear Unmarked Results', {
                click: (e) => {
                    this.results = this.results.filter((result) => {
                        if (!result.node.classList.contains('marked')) {
                            result.node.remove();
                        } else {
                            return result;
                        }
                    });
                }
            }],
            new NumberInput("#info_click_amount", {
                min: 1,
                init: this.amount_per_click,
                store_key: "info_generator_amount",
                store_event: "info_generator_amount_change"
            }).render(),
        ]]);

        ctwo(this.node, ['div .container_body', [
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
        ]]);
    }
}

module.exports = InfoContainer;
