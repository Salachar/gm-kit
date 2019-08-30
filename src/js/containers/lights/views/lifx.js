const LightsView = require('./lights/lights');
const ScenesView = require('./scenes/scenes');

class LIFXView {
    constructor (opts = {}) {
        this.container = opts.container;
        this.node = this.container.container_body;

        this.onRefreshCallback = opts.onRefresh;

        this.lights_view = new LightsView(this);
        this.scenes_view = new ScenesView(this);
    }

    onRefresh (e) {
        this.onRefreshCallback();
    }

    updateLights (lights) {
        if (!lights || !lights.all.length) return;
        this.lights_view.update(lights);
    }

    renderLights (lights) {
        if (!lights || !lights.all.length) return;
        this.lights_view.render(lights);
    }

    updateScenes (scenes) {
        if (!scenes || !scenes.all.length) return;
        this.scenes_view.update(scenes);
    }

    renderScenes (scenes) {
        if (!scenes || !scenes.all.length) return;
        this.scenes_view.render(scenes);
    }

    update (opts = {}) {
        this.updateLights(opts.Lights);
        this.updateScenes(opts.Scenes);
    }

    render (opts = {}) {
        this.renderLights(opts.Lights);
        this.renderScenes(opts.Scenes);
    }
}

module.exports = LIFXView;
