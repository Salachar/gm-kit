const {
    createElement
} = require('../../../../lib/dom');

const SceneView = require('./scene');

class ScenesView {
    constructor (parent) {
        this.parent = parent;
        this.node = null;

        this.scene_views = {};
    }

    update (scenes) {
        for (let sv in this.scene_views) {
            this.scene_views[sv].update(scenes.by_uuid[sv]);
        }
    }

    render (scenes) {
        this.node = createElement('div', 'lifx_section', {
            addTo: this.parent.node
        });

        createElement('div', 'lifx_section_title', {
            html: 'Scenes',
            addTo: this.node
        });

        scenes.all.forEach((scene) => {
            let scene_view = new SceneView(this.node, scene);
            scene_view.render();
            this.scene_views[scene.uuid] = scene_view;
        });
    }
}

module.exports = ScenesView;
