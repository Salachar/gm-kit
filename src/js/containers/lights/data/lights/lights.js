const http = require('../../lib/http');
const Light = require('./light');

class Lights {
    constructor () {
        this.all = [];
        this.by_id = {};
        this.by_label = {};
        this.by_selector = {};
    }

    clearLights () {
        this.all = [];
        this.by_id = {};
        this.by_label = {};
        this.by_selector = {};
    }

    addLight (new_light) {
        this.all.push(new_light);
        this.by_id[new_light.id] = new_light;
        this.by_label[new_light.label] = new_light;
        this.by_selector['id:' + new_light.id] = new_light;
    }

    fetch () {
        return new Promise((resolve, reject) => {
            this.clearLights();
            http("https://api.lifx.com/v1/lights/all", {
                success: (response) => {
                    this.parse(response);
                    resolve();
                },
                error: (response) => {
                    console.log(response);
                    resolve();
                }
            });
        });
    }

    parse (lights_data) {
        lights_data.forEach((light_data) => {
            this.addLight(new Light(light_data));
        });
    }
}

module.exports = Lights;
