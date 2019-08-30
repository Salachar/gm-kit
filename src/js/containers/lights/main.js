const Container = require('../base');
const ContainerTemplate = require('../../templates/lights');

const LIFX = require('./data/lifx');

/*
    xhr.getAllResponseHeaders()
    xhr.getResponseHeader(header)

    The above can used to grab the headers from the LIFX reponses if needed:
        X-RateLimit-Limit : The total number of requests per 60 second window.
        X-RateLimit-Remaining : The number of requests you are allowed to make in the current 60 second window.
        X-RateLimit-Reset : The Unix timestamp for when the next window begins.

    The 120 limit per 60 seconds shouldn't matter as I will bunch everything into one lights /states call
    All lights from selected scenes will be mashed together, with appropriate lights being overwritten as
    scenes are selected. Individual light selection for a trigger will override anything from a scene.
*/

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
