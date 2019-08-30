const http = require('../../../../lib/http');

const Scene = require('./scene');

class Scenes {
    constructor (opts = {}) {
        this.all = [];
        this.by_uuid = {};
        this.by_name = {};

        this.onSceneActivation = opts.onSceneActivation || function(){};
    }

    clearScenes () {
        this.all = [];
        this.by_uuid = {};
        this.by_name = {};
    }

    addScene (new_scene) {
        this.all.push(new_scene);
        this.by_uuid[new_scene.uuid] = new_scene;
        this.by_name[new_scene.name] = new_scene;
    }

    updateLights (lights) {
        this.all.forEach((scene) => {
            scene.updateLights(lights);
        });
        // Something something map to the lights in states
    }

    fetch (Lights) {
        //
        return new Promise((resolve, reject) => {
            this.clearScenes();
            http("https://api.lifx.com/v1/scenes", {
                headers: {
                    "Authorization": `Bearer ${CONFIG.lifx_access_code}`,
                    "Content-Type": "application/json"
                },
                success: (response) => {
                    this.parse(response, Lights);
                    resolve();
                },
                error: (response) => {
                    reject(response);
                }
            });
        });
    }

    parse (scenes_data, Lights) {
        scenes_data.forEach((scene_data) => {
            this.addScene(new Scene({
                scene: scene_data,
                lights: Lights,
                onActivate: this.onSceneActivation
            }));
        });
    }
}

module.exports = Scenes;
