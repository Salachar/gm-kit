const Container = require('../base');
const ContainerTemplate = require('../../templates/map');

class MapContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'map',
            template: ContainerTemplate
        });
    }
}

module.exports = MapContainer;
