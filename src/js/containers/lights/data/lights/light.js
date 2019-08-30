const http = require('../../../../lib/http');
const {
    HSVtoRGB
} = require('../../../../lib/helpers');

class Light {
    constructor (light_data) {
        this.original = this.parse(light_data);

        this.updateProps(light_data);

        // Scenes that this light belongs to.
        this.scenes = {};
    }

    parse (light_data) {
        // selector, power, and duration are all in the same spot
        let obj = {
            selector: light_data.id,
            power: light_data.power,
            duration: 1
        };

        // Depending on the type of light, there are zones instead of a single color
        // When updating the light though, you don't have to use zones and can pass in
        // a single color at the top level, setting the whole thing. We're probably
        // never going to worry about zone setting in this app
        if (light_data.zones && light_data.zones.length) {
            let state = light_data.zones[0].state;
            obj.color = state.color;
            obj.brightness = state.brightness;
        } else {
            obj.color = light_data.color;
            obj.brightness = light_data.brightness;
        }

        // Verify a completely seperate instance if needed
        return JSON.parse(JSON.stringify(obj));
    }

    set power (power) {
        this.props.power = power;
    }

    get power () {
        return this.props.power;
    }

    set color (color) {
        this.props.color = color;
    }

    get color () {
        return this.props.color;
    }

    set brightness (brightness) {
        this.props.brightness = brightness;
    }

    get brightness () {
        return this.props.brightness;
    }

    set duration (duration) {
        this.props.duration = duration;
    }

    get duration () {
        return this.props.duration;
    }

    updateProps (light_data) {
        this.id = light_data.id;
        this.label = light_data.label;
        this.data = light_data;

        this.props = this.parse(light_data);

        this.rgb = HSVtoRGB({
            h: this.color.hue / 360,
            s: this.color.saturation,
            v: 1
        });
    }

    addScene (opts = {}) {
        let { scene, data } = opts;
        let color = data.color;
        if (data.zones && data.zones.length) {
            color = data.zones[0].state.color;
        }

        data.rgb = HSVtoRGB({
            h: color.hue / 360,
            s: color.saturation,
            v: 1
        });
        this.scenes[scene.uuid] = data;
    }

    update (data) {
        // {
        //     "power": "on",
        //     "color": "blue saturation:0.5",
        //     "brightness": 0.5,
        //     "duration": 5,
        // }
        return new Promise((resolve, reject) => {
            http(`https://api.lifx.com/v1/lights/id:${this.id}/state`, {
                type: 'PUT',
                data: JSON.stringify(data || this.props),
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
}

module.exports = Light;
