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
      'onmapshow': this.onMapShow.bind(this),
      'onmaphide': this.onMapHide.bind(this),
      'brightness_(ps)': this.updateBrightness.bind(this),
    }, this.map_instance.name);
  }

  onMapShow () {
    if (this.video) this.video.play();
  }

  onMapHide () {
    if (this.video) this.video.pause();
  }

  load () {
    return new Promise((resolve, reject) => {
      if (!this.map_data.image && !this.map_data.video) {
        reject();
        return;
      }

      if (this.map_type === 'video') {
        this.video.src = this.map_data.video;
        this.video.loop = true;
        this.video.play();

        this.width = 1920;
        this.height = 1080;
        this.ratio = 16 / 9;

        resolve();
        return;
      }

      this.image = new Image;
      this.image.onload = () => {
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        this.ratio = this.width / this.height;
        this.confine();
        resolve();
      }

      if (!CONFIG.is_player_screen) {
        this.image.src = this.map_data.dm_version || this.map_data.image;
      } else {
        this.image.src = this.map_data.image || this.map_data.dm_version;
      }
    });
  }

  confine () {
    if (this.map_type === 'video') return;

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
      if (this.map_type === 'video') {
        this.video.style.filter = `brightness(${this.brightness}%)`;
      } else {
        this.canvas.style.filter = `brightness(${this.brightness}%)`;
      }
    }
  }

  draw () {
    if (this.map_type === 'video') return this;
    this.context.drawImage(this.image, 0, 0, this.width, this.height);
    return this;
  }
}

module.exports = ImageCanvas;
