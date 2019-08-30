const {
    createElement
} = require('../../../../lib/dom');

const LightView = require('./light');

class LightsView {
    constructor (parent) {
        this.parent = parent;

        this.node = null;

        this.light_views = [];
    }

    update (lights) {
        for (let lv in this.light_views) {
            this.light_views[lv].update(lights.by_id[lv]);
        }
    }

    render (lights) {
        this.node = createElement('div', 'lifx_section', {
            addTo: this.parent.node
        });

        createElement('div', 'lifx_section_title', {
            html: 'Lights',
            addTo: this.node
        });

        lights.all.forEach((light) => {
            let light_view = new LightView(this.node, light);
            light_view.render();
            this.light_views[light.id] = light_view;
        });
    }
}

module.exports = LightsView;
