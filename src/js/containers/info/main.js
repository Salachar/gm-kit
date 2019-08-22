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

const {
    createElement
} = require('../../helpers');

const InfoTemplate = require('../../templates/info');

class InfoContainer {
    constructor (opts = {}) {
        this.node = createElement('div', 'info_container container active', {
            addTo: document.getElementById('containers')
        });
        this.tab = createElement('div', 'tab active', {
            html: 'Info',
            addTo: document.getElementById('tabs'),
            events: {
                click: (e) => {
                    [...document.getElementsByClassName('tab')].forEach((tab) => {
                        tab.classList.remove('active');
                    });
                    this.tab.classList.add('active');
                    [...document.getElementsByClassName('container')].forEach((container) => {
                        container.classList.remove('active');
                    });
                    this.node.classList.add('active');
                }
            }
        });

        this.template = new InfoTemplate();

        if (opts.render) {
            this.render();
        }

        this.amount_per_click = 1;

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

    setEvents () {
        [...document.getElementsByClassName('amount_button')].forEach((amount_button) => {
            amount_button.addEventListener('click', (e) => {
                this.amount_per_click = parseInt(e.currentTarget.getAttribute('data-amount'), 10);
                [...document.getElementsByClassName('amount_button')].forEach((amount_button) => {
                    amount_button.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
            });
        });

        document.getElementById('clear_results_all').addEventListener('click', (e) => {
            document.getElementById('info_results').innerHTML = '';
        });

        document.getElementById('clear_results').addEventListener('click', () => {
            [...document.getElementsByClassName('result')].forEach((result) => {
                if (!result.classList.contains('saved')) {
                    result.remove();
                }
            });
        });

        // $('body').on('click', '.result', function () {
        //     $(this).toggleClass('saved');
        // });
    }

    render () {
        this.node.innerHTML = this.template.generate();
    }
}

module.exports = InfoContainer;
