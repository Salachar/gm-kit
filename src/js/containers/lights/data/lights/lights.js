const http = require('../../../../lib/http');
const Light = require('./light');

class Lights {
    constructor () {
        this.all = [];
        this.by_id = {};
        this.by_label = {};
        this.by_selector = {};
    }

    reset () {
        return this.update({
            states: this.all.map((light) => {
                return light.original;
            }),
            defaults: {
                duration: 1
            }
        });
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
            http("https://api.lifx.com/v1/lights/all", {
                headers: {
                    "Authorization": `Bearer ${CONFIG.lifx_access_code}`,
                    "Content-Type": "application/json"
                },
                success: (response) => {
                    this.parse(response);
                    resolve();
                },
                error: (response) => {
                    reject(response);
                }
            });
        });
    }

    update (states_data) {
        // {
        //     "states": [
        //       {
        //         "selector": "[selector 1]",
        //         "power": "on"
        //       },
        //       {
        //         "selector": "[selector N]",
        //         "brightness": 0.5
        //       }
        //     ],
        //     "defaults": {
        //       "duration": 5.0 // all states will be applied over 5 seconds
        //     }
        // }
        return new Promise((resolve, reject) => {
            if (!states_data) {
                console.error('No explicit lights data was passed');
                return reject();
            }

            http(`https://api.lifx.com/v1/lights/states`, {
                type: 'PUT',
                data: JSON.stringify(states_data),
                headers: {
                    "Authorization": `Bearer ${CONFIG.lifx_access_code}`,
                    "Content-Type": "application/json"
                },
                success: (response) => {
                    resolve(response);
                },
                error: (response) => {
                    reject(response);
                }
            });
        });
    }

    parse (lights_data) {
        lights_data.forEach((light_data) => {
            const id = light_data.id;
            if (this.by_id[id]) {
                this.by_id[id].updateProps(light_data);
            } else {
                this.addLight(new Light(light_data));
            }
        });
    }
}

module.exports = Lights;
