const { createElement } = require('../../../../lib/dom');
const { clear } = require('../../../../lib/canvas');

class Base {
    constructor (name, opts = {}) {
        this.name = name;
        this.map_data = opts.map_data;
        this.map_instance = opts.map_instance;
        this.manager = opts.manager;

        this.create();
    }

    create () {
        this.canvas = createElement('canvas', `${this.name}_canvas map_canvas`, {
            addTo: this.manager.canvas_container
        });
        this.context = this.canvas.getContext('2d');
    }

    clear () {
        clear(this.context);
        return this;
    }

    show () {
        this.canvas.classList.remove('hidden');
        return this;
    }

    hide () {
        this.canvas.classList.add('hidden');
        return this;
    }

    draw () {
        return this;
    }

    resize (width, height) {
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        return this;
    }
}

module.exports = Base;