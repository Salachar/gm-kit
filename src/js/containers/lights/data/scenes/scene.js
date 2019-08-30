const http = require('../../../../lib/http');

class Scene {
    constructor (opts = {}) {
        this.data = opts.scene;

        this.uuid = this.data.uuid;
        this.name = this.data.name;

        this.states = this.data.states;

        this.lights_in_scene = [];
        this.updateLights(opts.lights);

        this.props = {
            duration: 1
        };

        this.onActivate = opts.onActivate || function(){};
    }

    updateLights (lights) {
        this.lights_in_scene = [];
        this.data.states.forEach((light_in_scene) => {
            const light = lights.by_selector[light_in_scene.selector];
            if (!light) return;
            light.addScene({
                scene: this,
                data: light_in_scene
            });
            this.lights_in_scene.push(light);
        });
    }

    isActive () {
        let active = true;
        this.lights_in_scene.forEach((light) => {
            if (light.rgb.string !== light.scenes[this.uuid].rgb.string) {
                active = false;
            }
        });
        return active;
    }

    activate () {
        return new Promise((resolve, reject) => {
            http(`https://api.lifx.com/v1/scenes/scene_id:${this.uuid}/activate`, {
                type: 'PUT',
                data: JSON.stringify(this.props),
                headers: {
                    "Authorization": `Bearer ${CONFIG.lifx_access_code}`,
                    "Content-Type": "application/json"
                },
                success: (response) => {
                    this.onActivate();
                    resolve(response);
                },
                error: (response) => {
                    reject(response);
                }
            });
        });
    }
}

module.exports = Scene;
