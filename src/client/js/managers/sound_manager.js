class SoundManager {
  constructor () {
    this.effects = {
      open_door: {
        sfx: null,
        volume: 0.3,
        file: "../audio/door_open.mp3",
      },

      close_door: {
        sfx: null,
        volume: 0.3,
        file: "../audio/door_close.mp3",
      }
    };

    this.setup();
  }

  setup () {
    for (let e in this.effects) {
      this.effects[e].sfx = new Audio(this.effects[e].file);
    }
  }

  play (sound) {
    if (!this.effects[sound]) return;
    if (!this.effects[sound].sfx) return;
    this.effects[sound].sfx.volume = this.effects[sound].volume || 0.5;
    this.effects[sound].sfx.play();
  }
};

module.exports = SoundManager;
