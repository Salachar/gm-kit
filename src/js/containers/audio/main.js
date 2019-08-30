const Container = require('../base');
const AudioManager = require('./audio');
const ContainerTemplate = require('../../templates/audio');

class AudioContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'audio',
            template: ContainerTemplate
        });

        this.audio_manager = new AudioManager();

        this.setIPCEvents();
        IPC.send('audio_loaded');
    }

    setIPCEvents () {
        // Audio Data is loaded first, then the files
        IPC.on('data_loaded', (e, data_json) => {
            this.audio_manager.data.set(JSON.parse(data_json));
        });
        // Files are loaded second
        IPC.on('files_loaded', (e, files_json) => {
            this.audio_manager.buildAudioList(files_json);
        });
    }
};

module.exports = AudioContainer;
