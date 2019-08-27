const Container = require('../base');
const ContainerTemplate = require('../../templates/lights');

const LIFX = require('./data/lifx');

class LightsContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'lights',
            template: ContainerTemplate
        });

        this.lifx = new LIFX({
            container: this
        });
        this.lifx.fetch({
            render: true
        });
    }
}

module.exports = LightsContainer;
