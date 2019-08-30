const Lights = require('./lights/lights');
const Scenes = require('./scenes/scenes');
const LIFXView = require('../views/lifx');

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

        document.getElementById('lifx_access_code_input').value = CONFIG.lifx_access_code;

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
        }).catch((e) => {
            console.log(e);
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

        document.getElementById('lifx_access_code_save').addEventListener('click', (e) => {
            const input = document.getElementById('lifx_access_code_input');
            const lifx_access_code = input.value;
            CONFIG.lifx_access_code = lifx_access_code;
            IPC.send('lifx_access_code', lifx_access_code);
            this.refresh();
        });

        document.getElementById('lifx_reset').addEventListener('click', (e) => {
            this.Lights.reset().then(() => {
                this.refresh();
            }).catch(() => {
                console.error('There has been a problem resetting the lights back to original settings');
            });
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
