const {
    createElement
} = require('../../helpers');

const AudioManager = require('./audio');
const AudioTemplate = require('../../templates/audio');

class AudioContainer {
    constructor (opts = {}) {
        this.node = createElement('div', 'audio_container container', {
            addTo: document.getElementById('containers')
        });
        this.tab = createElement('div', 'tab active', {
            html: 'Audio',
            addTo: document.getElementById('tabs'),
            events: {
                click: (e) => {
                    [...document.getElementsByClassName('tab')].forEach((tab) => {
                        tab.classList.remove('active');
                    });
                    this.tab.classList.add('active');
                    [...document.getElementsByClassName('container')].forEach((container) => {
                        container.classList.remove('active');
                    });
                    this.node.classList.add('active');
                }
            }
        });

        this.template = new AudioTemplate();

        if (opts.render) {
            this.render();
        }

        this.audio_manager = new AudioManager();

        this.setIPCEvents();

        IPC.send('audio_loaded');
        // ipc.send('app_loaded');
    }

    setIPCEvents () {
        // Audio Data is loaded first, then the files
        IPC.on('data_loaded', (e, data_json) => {
            console.log('Data has loaded');
            this.audio_manager.data.set(JSON.parse(data_json));
        });

        // Files are loaded second
        IPC.on('files_loaded', (e, files_json) => {
            console.log(e, files_json);
            this.audio_manager.buildAudioList(files_json);
        });
    }

    render () {
        this.node.innerHTML = this.template.generate();
    }
};

module.exports = AudioContainer;