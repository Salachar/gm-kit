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
            this.refs.audio_player_current_time.innerHTML = '0';
            this.duration = this.player.duration;
            this.refs.audio_player_duration.innerHTML = parseInt(this.duration, 10);
        }

        this.player.ontimeupdate = () => {
            if (this.time && Math.abs(this.player.currentTime - this.time) <= 1) return;
            this.time = parseInt(this.player.currentTime, 10);
            this.refs.audio_player_current_time.innerHTML = this.time;
            const width = parseFloat((this.time / this.duration) * 100, 10);
            this.refs.audio_player_progress_played.style.width = width + '%';
        }

        this.player.onended = () => {}
    }

    set volume (new_volume) {
        this.player.volume = new_volume.toFixed(2);
        this.refs.audio_player_volume.value = this.player.volume;
    }

    get volume () {
        return this.player.volume;
    }

    start (track) {
        this.player.src = track.source;
        this.refs.audio_player_now_playing.innerHTML = track.name;
        this.clear();
        this.play();
    }

    play () {
        this.paused = false;
        this.player.play();
        this.refs.audio_player_play_pause.text('PAUSE');
    }

    pause () {
        this.paused = true;
        this.player.pause();
        this.refs.audio_player_play_pause.text('PLAY');
    }

    clear () {
        this.time = 0;
        this.duration = 0;
    }

    render () {
        return Lib.dom.generate(['div #audio_player', [
            ['div .header_controls', [
                new Button('#audio_player_play_pause', {
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
                new Checkbox('#audio_player_loop', {
                    text: 'LOOP',
                    checked: this.player.loop,
                    onchange: (checked) => {
                        this.player.loop = checked;
                    }
                }),
                new NumberInput('#audio_player_volume .inline', {
                    text: 'Volume',
                    parent: this,
                    step: 0.01,
                    interval: 300,
                    min: 0,
                    max: 1,
                    store_key: 'audio_volume',
                    store_event: 'audio_volume_change',
                }),
                new Button('#choose_audio_directory', {
                    text: 'Choose Audio Directory',
                    onclick: (e) => IPC.send('choose_audio_directory'),
                }),
            ]],

            ['div #audio_player_progress', {
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
                ['div #audio_player_current_time'],
                ['div #audio_player_progress_played'],
                ['div #audio_player_now_playing'],
                ['div #audio_player_duration'],
            ]],
        ]], this);
    }
}

module.exports = AudioPlayer;
