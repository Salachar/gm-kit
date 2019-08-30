const {
    createElement,
    configureElement
} = require('../../../../lib/dom');

class LightView {
    constructor (el_parent, light, scene) {
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

        const power = this.light.power;
        this.light.power = (power === 'on') ? 'off' : 'on';

        this.light.update().then((response) => {
            this.update();
        }).catch((response) => {
            console.error('Light has failed to update');
        });
    }

    update (light) {
        this.light = light || this.light;

        configureElement(this.el_light, {
            css: {
                borderColor: this.color,
                opacity: (this.light.power === 'on') ? 1 : 0.2
            },
            html: this.brightness_text
        });

        configureElement(this.el_title, {
            css: {
                opacity: (this.light.power === 'on') ? 1 : 0.5
            }
        })
    }

    render () {
        this.el_base = createElement('div', 'lifx_light_container', {
            addTo: this.el_parent
        });

        this.el_light = createElement('div', 'lifx_light', {
            attributes: {
                title: this.light.label,
            },
            events: {
                click: (e) => {
                    this.onClick(e);
                }
            },
            css: {
                borderColor: this.color,
                opacity: (this.light.power === 'on') ? 1 : 0.2
            },
            html: this.brightness_text,
            addTo: this.el_base
        });

        this.el_title = createElement('div', 'lifx_light_title', {
            html: this.light.label,
            addTo: this.el_base
        });
    }
}

module.exports = LightView;
