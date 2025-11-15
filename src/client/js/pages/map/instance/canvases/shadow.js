const {
  clear,
} = Lib.canvas;

const Base = require('./base');
class ShadowCanvas extends Base {
  constructor (opts = {}) {
    super('shadow', opts);
  }

  get data () {
    return {};
  }

  draw () {
    // The shadow drawn on the light layer, what the players haven't seen
    clear(this.context).rect(this.context, {
      alpha: CONFIG.display.fog[CONFIG.window].hidden.opacity,
      color: CONFIG.display.fog[CONFIG.window].hidden.color,
    });

    return this;
  }
}

module.exports = ShadowCanvas;
