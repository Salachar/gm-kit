const Container = require('../base');
const ContainerTemplate = require('../../templates/lights');

class LightsContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'lights',
            template: ContainerTemplate
        });
    }
}

module.exports = LightsContainer;
