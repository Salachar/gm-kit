const Container = require('../base');
const ContainerTemplate = require('../../templates/info');

const {
    createElement
} = require('../../lib/helpers');

const generators = {
    deva_generator: require('./generators/deva'),
    dragonborn_generator: require('./generators/dragonborn'),
    dwarf_generator: require('./generators/dwarf'),
    elf_generator: require('./generators/elf'),
    gnome_generator: require('./generators/gnome'),
    halfling_generator: require('./generators/halfling'),
    human_generator: require('./generators/human'),
    tiefling_generator: require('./generators/tiefling'),
    quests_generator: require('./generators/quests'),
    stores_generator: require('./generators/stores'),
    stores_random_generator: require('./generators/stores_random'),
    tavern_generator: require('./generators/tavern'),
    // treasure_generator: require('./generators/treasure'),
};

class InfoContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'info',
            template: ContainerTemplate
        });

        this.amount_per_click = 1;

        this.results = [];

        this.el_buttons = document.getElementById('info_buttons');
        this.el_results = document.getElementById('info_results');

        this.initGenerators();
        this.setEvents();
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

        document.getElementById('generate_amount').addEventListener('keyup', (e) => {
            const value = e.currentTarget.value;
            if (isNaN(value)) value = 1;
            this.amount_per_click = value;
        });
    }
}

module.exports = InfoContainer;
