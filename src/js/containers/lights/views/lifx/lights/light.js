const Base = require('../../base');

class LightView extends Base {
    constructor (el_parent, light, scene) {
        super();

        this.el_parent = el_parent;

        this.light = light;
        this.scene = scene;
    }

    get color () {
        let color = this.light.rgb.string;
        if (this.scene) {
            color = this.light.scenes[this.scene.uuid].rgb.string;
        }
        return color;
    }

    get brightness_text () {
        let brightness = this.light.brightness;
        if (this.scene) {
            brightness = this.light.scenes[this.scene.uuid].brightness
        }
        return Math.round(brightness * 100) + '%';
    }

    onClick (e) {
        if (this.scene) {
            this.scene.activate();
            return;
        }

        if (this.light.props.power === 'on') {
            this.light.props.power = 'off';
        } else {
            this.light.props.power = 'on';
        }
        this.light.update();
    }

    update (light) {
        this.light = light;
        this.updateElement(this.el_light, {
            styles: {
                borderColor: this.color
            },
            html: this.brightness_text
        });
    }

    render () {
        this.el_base = this.createElement('div', 'lifx_light_container', {
            addTo: this.el_parent
        });

        this.el_light = this.createElement('div', 'lifx_light', {
            attributes: {
                title: this.light.label,
            },
            handlers: {
                click: (e) => {
                    this.onClick(e);
                }
            },
            styles: {
                borderColor: this.color,
                opacity: (this.light.power === 'on') ? 1 : 0.2
            },
            html: this.brightness_text,
            addTo: this.el_base
        });

        this.el_title = this.createElement('div', 'lifx_light_title', {
            html: this.light.label,
            addTo: this.el_base
        });
    }
}

module.exports = LightView;
