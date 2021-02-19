const {
    createElement
} = Lib.dom;

const {
    clear
} = Lib.canvas;

class Base {
    constructor (name, opts = {}) {
        const { map_data = {}, map_instance, manager } = opts;
        const { type } = map_data

        this.name = name;
        this.map_data = map_data;
        this.map_type = type;
        this.map_instance = map_instance;
        this.manager = manager;

        this.create();
    }

    create () {
        if (this.name === 'image' && this.map_type === 'video') {
            this.video = createElement('video', `${this.name}_canvas map_canvas`, {
                addTo: this.manager.canvas_container
            });
            return;
        }

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
        // TODO : something video

        if (this.video) {
            this.video.setAttribute('width', width);
            this.video.setAttribute('height', height);
            this.video.style.width = width + 'px';
            this.video.style.height = height + 'px';
        }


        if (!this.canvas) return;

        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        return this;
    }
}

module.exports = Base;