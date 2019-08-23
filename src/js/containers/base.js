const {
    createElement
} = require('../helpers');

class Container {
    constructor (opts = {}) {
        this.template = null;
        this.node = null;
        this.tab = null;

        this.type = opts.type;

        this.createNode(this.type);
        this.createTab(this.type);
        this.createTemplate(opts);

        if (opts.active === true) {
            this.setActive(opts.active);
        }
    }

    createNode (class_name) {
        this.node = createElement('div', `${class_name} container`, {
            addTo: document.getElementById('containers')
        });
    }

    createTab (tab_title) {
        this.tab = createElement('div', 'tab', {
            html: tab_title,
            addTo: document.getElementById('tabs'),
            events: {
                click: (e) => {
                    this.setActive();
                }
            }
        });
    }

    createTemplate (opts) {
        this.template = new opts.template();
        // Always render unless false is explicity passed in
        if (opts.render !== false) this.render();
    }

    setActive () {
        [...document.getElementsByClassName('tab')].forEach((tab) => {
            tab.classList.remove('active');
        });
        this.tab.classList.add('active');
        [...document.getElementsByClassName('container')].forEach((container) => {
            container.classList.remove('active');
        });
        this.node.classList.add('active');
    }

    render () {
        this.node.innerHTML = this.template.generate();
    }
}

module.exports = Container;