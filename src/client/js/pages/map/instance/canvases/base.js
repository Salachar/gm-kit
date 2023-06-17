const {
  clear
} = Lib.canvas;

class Base {
  constructor (name, opts = {}) {
    const {
      map_data = {},
      map_instance,
      manager,
    } = opts;

    this.name = name;
    this.map_data = map_data;

    this.map_type = map_data.video ? 'video' : 'image';

    this.map_instance = map_instance;
    this.manager = manager;

    this.create();
  }

  create () {
    const class_name = `.${this.name}_canvas .map_canvas`;

    // Create a video layer instead of a canvas if using
    // a video instead of an image
    if (this.name === 'image' && this.map_type === 'video') {
      this.video = Lib.dom.generate([`video ${class_name}`], null, this.manager.canvas_container);
      // TODO: Maybe add controls for map video audio?
      // this.video.muted = true;
      return;
    }

    this.canvas = Lib.dom.generate([`canvas ${class_name}`], null, this.manager.canvas_container);
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
