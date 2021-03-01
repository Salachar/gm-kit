class AudioData {
    constructor (opts = {}) {
        this.parent = opts.parent;

        this.__tracks = {};
        this.__previous = {};
        this.__collapse = {};
        this.__volume = 0.1;
    }

    set tracks (new_tracks) {
        this.__tracks = new_tracks;
    }

    get tracks () {
        return this.__tracks;
    }

    set previous (new_previous) {
        this.__previous = new_previous;
    }

    get previous () {
        return this.__previous;
    }

    set collapse (new_collapse) {
        this.__collapse = new_collapse;
    }

    get collapse () {
        return this.__collapse;
    }

    set volume (new_volume) {
        this.__volume = new_volume;
    }

    get volume () {
        return this.__volume;
    }

    add (track) {
        if (!this.tracks[track.key]) {
            this.tracks[track.key] = {
                source: track.path,
                name: track.name,
                key: track.key,
                tags: []
            };
        } else {
            // Always update the path for the track, renaming/moving the folder will change
            // the source which always needs to be updated. Other data should remain the same, and
            // we certainly don't want to overwrite the tags.
            this.tracks[track.key].source = track.path
            // Cleanup existing tracks
            delete this.tracks[track.key].visited;
            delete this.tracks[track.key].node;
        }
    }

    save () {
        IPC.send('save_audio_json', {
            tracks: this.tracks,
            previous: this.previous,
            collapse: this.collapse,
            volume: this.volume
        });
    }

    set (data) {
        if (!data) return;
        try {
            this.tracks = data.tracks || {};
            this.previous = data.previous || {};
            this.collapse = data.collapse || {};
            this.volume =  data.volume || 0.1;

            this.parent.player.volume = this.volume;
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = AudioData;
