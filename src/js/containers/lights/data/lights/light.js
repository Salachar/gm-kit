const http = require('../../lib/http');

class Light {
    constructor (light_data) {
        this.id = light_data.id;
        this.label = light_data.label;

        this.data = light_data;

        this.props = {
            power: light_data.power,
            color: "blue saturation:0.5",
            brightness: light_data.brightness,
            duration: 1
        };

        this.color = light_data.color;

        this.rgb = this.HSVtoRGB({
            h: this.color.hue / 360,
            s: this.color.saturation,
            v: 1
        });

        // Scenes that this light belongs to.
        this.scenes = {};
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

    addScene (opts = {}) {
        let { scene, data } = opts;
        data.rgb = this.HSVtoRGB({
            h: data.color.hue / 360,
            s: data.color.saturation,
            v: 1
        });
        this.scenes[scene.uuid] = data;
    }

    update () {
        http(`https://api.lifx.com/v1/lights/id:${this.id}/state`, {
            type: 'PUT',
            data: JSON.stringify(this.props),
            success: (response) => {
                console.log(response);
            },
            error: (response) => {
                console.log(response);
            }
        });
    }

    HSVtoRGB (hsv) {
        let h = hsv.h;
        let s = hsv.s;
        let v = hsv.v;

        let r, g, b, i, f, p, q, t;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;

            case 1:
                r = q, g = v, b = p;
                break;

            case 2:
                r = p, g = v, b = t;
                break;

            case 3:
                r = p, g = q, b = v;
                break;

            case 4:
                r = t, g = p, b = v;
                break;

            case 5:
                r = v, g = p, b = q;
                break;
        }

        r = Math.floor(r * 255);
        g = Math.floor(g * 255);
        b = Math.floor(b * 255);

        return {
            r: r,
            g: g,
            b: b,
            string: `rgb(${r}, ${g}, ${b})`
        };
    }
}

module.exports = Light;
