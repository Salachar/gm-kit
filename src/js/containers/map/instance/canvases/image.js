const { configureElement } = require('../../../../lib/dom');

const Base = require('./base');
class ImageCanvas extends Base {
    constructor (opts = {}) {
        super('image', opts);

        this.image = null;

        this.width = CONFIG.window_width;
        this.height = CONFIG.window_height;

        this.ratio = null;

        this.brightness = (this.map_data.json.meta || {}).brightness || 100;

        Store.register({
            'brightness_(ps)': this.updateBrightness.bind(this),
        }, this.map_instance.name);
    }

    load () {
        return new Promise((resolve, reject) => {
            if (!this.map_data.image) {
                reject();
                return;
            }

            this.image = new Image;
            this.image.onload = () => {
                this.width = this.image.naturalWidth;
                this.height = this.image.naturalHeight;
                this.ratio = this.width / this.height;

                this.confine();

                resolve(this.image);
            }

            if (!CONFIG.is_player_screen) {
                this.image.src = this.map_data.dm_image || this.map_data.image;
            } else {
                this.image.src = this.map_data.image || this.map_data.dm_image;
            }
        });
    }

    confine () {
        if (this.width > CONFIG.max_map_size || this.height > CONFIG.max_map_size) {
            if (this.ratio > 1) {
                // Image is wider than it is taller
                this.width = CONFIG.max_map_size;
                this.height = this.width / this.ratio;
            } else if (this.ratio < 1) {
                // Image is taller than it is wider
                this.height = CONFIG.max_map_size;
                this.width = this.height * this.ratio;
            } else {
                // Image is a square or something
                this.width = CONFIG.max_map_size;
                this.height = CONFIG.max_map_size;
            }
        }                
    }

    updateBrightness (data) {
        if (data && data.brightness) {
            this.brightness = data.brightness;
        }
        if (CONFIG.is_player_screen) {
            configureElement(this.canvas, {
                css: {
                    filter: `brightness(${this.brightness}%)`
                }
            });
        }
    }

    draw () {
        this.context.drawImage(this.image, 0, 0, this.width, this.height);
        return this;
    }
}

module.exports = ImageCanvas;