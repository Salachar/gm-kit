const { copy } = require('../../../../lib/helpers');
const { size, clear, line } = require('../../../../lib/canvas');

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
            }
        };

        Store.register({
            "toggle_grid_(ps)": this.toggle.bind(this),
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
        this.draw();
    }

    toggle () {
        this.attributes.show = !this.attributes.show;
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
                    y: y
                }, {
                    x: canvas_size.width,
                    y: y
                }],
                alpha: 0.75,
                width: 2,
                color: '#000000'
            });
        }

        // Draw all the horizontal lines
        for (let x = this.attributes.offset.x; x < canvas_size.width; x += this.attributes.size) {
            line(this.context, {
                points: [{
                    x: x,
                    y: 0
                }, {
                    x: x,
                    y: canvas_size.height
                }],
                alpha: 0.75,
                width: 2,
                color: '#000000'
            });
        }

        return this;
    }
}

module.exports = GridCanvas;
