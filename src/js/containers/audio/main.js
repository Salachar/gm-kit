const Container = require('../base');
const AudioManager = require('./audio');
const ContainerTemplate = require('../../templates/audio');

const {
    cacheElements
} = require('../../lib/helpers');

class AudioContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'audio',
            template: ContainerTemplate
        });

        this.audio_manager = new AudioManager();

        cacheElements(this, [
            'no_audio_screen',
            'no_audio_screen_load',
            'choose_audio_directory'
        ]);

        this.setEvents();
        this.setIPCEvents();

        if (CONFIG.audio_directory) {
            IPC.send('audio_loaded');
        }
    }

    setEvents () {
        this.el_no_audio_screen_load.addEventListener('click', (e) => {
            IPC.send('open_audio_dialog_modal');
        });
        this.el_choose_audio_directory.addEventListener('click', (e) => {
            IPC.send('open_audio_dialog_modal');
        });
    }

    setIPCEvents () {
        IPC.on('audio_folder_chosen', (e) => {
            IPC.send('audio_loaded');
        });
        // Audio Data is loaded first, then the files
        IPC.on('data_loaded', (e, data_json) => {
            // debugger;
            this.audio_manager.data.set(data_json);
        });
        // Files are loaded second
        IPC.on('files_loaded', (e, files_json) => {
            // console.log('other thing');
            this.el_no_audio_screen.classList.add('hidden');
            this.audio_manager.buildAudioList(files_json);
        });
        IPC.on('audio_list_error', (e) => {
            // console.log('thing');
            this.el_no_audio_screen.classList.remove('hidden');
        });
    }
};

module.exports = AudioContainer;
