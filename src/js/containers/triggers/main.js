const Container = require('../base');
const ContainerTemplate = require('../../templates/triggers');

class TriggersContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'triggers',
            template: ContainerTemplate
        });
    }
}

module.exports = TriggersContainer;
