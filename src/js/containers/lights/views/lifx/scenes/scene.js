const Base = require('../../base');
const LightView = require('../lights/light');

class SceneView extends Base {
    constructor (el_parent, scene) {
        super();

        this.el_parent = el_parent;
        this.scene = scene;

        this.light_views = [];
    }

    setActive () {
        if (this.scene.isActive()) {
            this.el_base.classList.add('active');
        } else {
            this.el_base.classList.remove('active');
        }
    }

    update (scene) {
        console.log('scene update');
        this.scene = scene;
        this.setActive();
    }

    render () {
        this.el_base = this.createElement('div', 'lifx_scene', {
            addTo: this.el_parent
        });

        this.setActive();

        this.createElement('div', 'lifx_scene_title', {
            html: this.scene.name,
            addTo: this.el_base
        });

        this.scene.lights_in_scene.forEach((light) => {
            let light_view = new LightView(this.el_base, light, this.scene);
            light_view.render();
            this.light_views.push(light_view);
        });
    }
}

module.exports = SceneView;
