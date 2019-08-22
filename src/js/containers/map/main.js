const {
    createElement
} = require('../../helpers');

const MapTemplate = require('../../templates/map');

class MapContainer {
    constructor (opts = {}) {
        this.node = createElement('div', 'map_container container', {
            addTo: document.getElementById('containers')
        });
        this.tab = createElement('div', 'tab active', {
            html: 'Map',
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

        this.template = new MapTemplate();

        if (opts.render) {
            this.render();
        }
    }

    render () {
        this.node.innerHTML = this.template.generate();
    }
}

module.exports = MapContainer;
