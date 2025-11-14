const {
  copy,
} = Lib.helpers;
const {
  size,
  clear,
  line,
} = Lib.canvas;

const Base = require('./base');
class GridCanvas extends Base {
  constructor (opts = {}) {
    super('grid', opts);

    this.attributes = copy(this.map_data.json.grid) || {
      show: false,
      size: 50,
      offset: {
        x: 0,
        y: 0
      },
    };

    this.bright = false;

    Store.set({
      grid: copy(this.attributes)
    }, this.map_instance.name);

    Store.register({
      "overlay_grid_toggled_(ps)": this.toggle.bind(this),
      "bright_grid_toggled": () => {
        this.bright = !this.bright;
        this.draw();
      },
      "grid_size_update_(ps)": this.update.bind(this),
      "grid_offset_update_(ps)": this.update.bind(this),
    }, this.map_instance.name);
  }

  update (data) {
    if (data.size) {
      this.attributes.size = data.size;
    }
    if (data.offset) {
      this.attributes.offset.x += data.offset.x;
      this.attributes.offset.y += data.offset.y;
    }
    this.attributes.offset.x =  this.attributes.offset.x % this.attributes.size;
    this.attributes.offset.y =  this.attributes.offset.y % this.attributes.size;

    Store.fire('grid_update', {
      grid: copy(this.attributes)
    });

    this.draw();
  }

  toggle (data) {
    this.attributes.show = data.overlay_grid_enabled;
    this.draw();
  }

  draw () {
    clear(this.context);
    if (!this.attributes.show) return;
    const canvas_size = size(this.context);
    // Draw all the horizontal lines
    for (let y = this.attributes.offset.y; y < canvas_size.height; y += this.attributes.size) {
      line(this.context, {
        points: [{
          x: 0,
          y: y,
        }, {
          x: canvas_size.width,
          y: y,
        }],
        alpha: 0.75,
        width: 2,
        color: this.bright ? "#83f52c" : "#000",
      });
    }

    // Draw all the horizontal lines
    for (let x = this.attributes.offset.x; x < canvas_size.width; x += this.attributes.size) {
      line(this.context, {
        points: [{
          x: x,
          y: 0,
        }, {
          x: x,
          y: canvas_size.height,
        }],
        alpha: 0.75,
        width: 2,
        color: this.bright ? "#83f52c" : "#000",
      });
    }

    return this;
  }
}

module.exports = GridCanvas;
