const {
  clear,
} = Lib.canvas;

const Base = require('./base');
class ShroudCanvas extends Base {
  constructor (opts = {}) {
    super('shroud', opts);
  }

  draw () {
    // The area that has been seen by the players but is no longer lit
    clear(this.context).rect(this.context, {
      alpha: CONFIG.display.fog[CONFIG.window].seen.opacity,
      color: CONFIG.display.fog[CONFIG.window].seen.color
    });

    return this;
  }
}

module.exports = ShroudCanvas;
