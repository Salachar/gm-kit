const { clear, circle } = require('../../../../lib/canvas');

const Base = require('./base');
class LightsCanvas extends Base {
    constructor (opts = {}) {
        super('lights', opts);

        Store.register({
            'lights_cleared': this.draw.bind(this),
        }, this.map_instance.name);
    }

    draw () {
        if (CONFIG.is_player_screen) return;
        const lights = this.map_instance.managers.light.lights;
        clear(this.context);
        for (let l in lights) {
            circle(this.context, {
                point: lights[l],
                radius: this.map_instance.managers.light.light_width,
                color: '#FFFF99',
                alpha: 0.5
            });
        }

        return this;
    }
}

module.exports = LightsCanvas;