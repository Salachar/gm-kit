const Button = require('../../lib/inputs/button');
const Checkbox = require('../../lib/inputs/checkbox');
const NumberInput = require('../../lib/inputs/numberInput');

class AudioPlayer {
  constructor (opts = {}) {
    this.parent = opts.parent;

    this.paused = false;

    this.time = 0;
    this.duration = 0;

    this.player = new Audio();
    this.player.loop = true;

    Store.register({
      'audio_volume_change': this.onVolumeChange.bind(this),
    });

    this.setPlayerEvents();
  }

  onVolumeChange (data) {
    const new_volume = data.audio_volume;
    this.player.volume = new_volume;
    this.parent.data.volume = this.player.volume;
    this.parent.data.save();
  }

  setPlayerEvents () {
    this.player.ondurationchange = () => {
      this.refs.progress_time.innerHTML = '0';
      this.duration = this.player.duration;
      this.refs.progress_duration.innerHTML = parseInt(this.duration, 10);
    }

    this.player.ontimeupdate = () => {
      if (this.time && Math.abs(this.player.currentTime - this.time) <= 1) return;
      this.time = parseInt(this.player.currentTime, 10);
      this.refs.progress_time.innerHTML = this.time;
      const width = parseFloat((this.time / this.duration) * 100, 10);
      this.refs.progress_played.style.width = width + '%';
    }

    this.player.onended = () => {}
  }

  set volume (new_volume) {
    this.player.volume = new_volume.toFixed(2);
    this.refs.volume.value = this.player.volume;
  }

  get volume () {
    return this.player.volume;
  }

  start (track) {
    this.player.src = track.source;
    this.refs.progress_now_playing.innerHTML = track.name;
    this.clear();
    this.play();
  }

  play () {
    this.paused = false;
    this.player.play();
    this.refs.play_pause.text('PAUSE');
  }

  pause () {
    this.paused = true;
    this.player.pause();
    this.refs.play_pause.text('PLAY');
  }

  clear () {
    this.time = 0;
    this.duration = 0;
  }

  render () {
    return Lib.dom.generate(['#audio_player', [
      ['.header_controls', [
        new Button('#play_pause', {
          parent: this,
          text: 'PAUSE',
          onclick: (e) => {
            if (!this.player.src) return;
            this.paused = !this.paused;
            if (this.paused) {
              this.pause();
            } else {
              this.play();
            }
          },
        }),
        new Checkbox({
          text: 'LOOP',
          checked: this.player.loop,
          onchange: (checked) => {
            this.player.loop = checked;
          }
        }),
        new NumberInput('#volume .inline', {
          text: 'Volume',
          parent: this,
          step: 0.01,
          interval: 300,
          min: 0,
          max: 1,
          store_key: 'audio_volume',
          store_event: 'audio_volume_change',
        }),
      ]],

      ['.progress', {
        click: (e) => {
          var rect = e.currentTarget.getBoundingClientRect();
          var left = rect.left;

          var x_diff = e.pageX - left;
          var per = x_diff / e.currentTarget.clientWidth;
          var new_time = this.duration * per;

          if (new_time < 0) {
            new_time = 0;
          }
          if (new_time > this.duration) {
            new_time = this.duration;
          }

          this.time = 0;
          this.player.currentTime = new_time;
        }
      }, [
        ['#progress_time'],
        ['#progress_played'],
        ['#progress_now_playing'],
        ['#progress_duration'],
      ]],
    ]], this);
  }
}

module.exports = AudioPlayer;
