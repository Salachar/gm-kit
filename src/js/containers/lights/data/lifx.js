const Lights = require('./lights/lights');
const Scenes = require('./scenes/scenes');
const LIFXView = require('../views/lifx/lifx');

class LIFX {
    constructor (opts = {}) {
        this.container = opts.container;

        this.Lights = new Lights();
        this.Scenes = new Scenes({
            onSceneActivation: this.onSceneActivation.bind(this)
        });

        this.view = new LIFXView({
            container: this.container
        });

        this.setEvents();
    }

    onSceneActivation () {
        this.refresh();
    }

    refresh () {
        this.Lights.fetch().then(() => {
            this.Scenes.updateLights(this.Lights);
            this.view.update({
                Lights: this.Lights,
                Scenes: this.Scenes
            });
        });
    }

    fetch (opts = {}) {
        this.Lights.fetch().then(() => {
            this.Scenes.fetch(this.Lights).then(() => {
                if (opts.render) this.render();
            });
        });
    }

    setEvents () {
        document.getElementById('lifx_refresh').addEventListener('click', (e) => {
            this.refresh();
        });
    }

    render () {
        this.view.render({
            Lights: this.Lights,
            Scenes: this.Scenes
        });
    }
}

module.exports = LIFX;
