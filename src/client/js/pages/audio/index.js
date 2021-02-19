const Container = require('../base');
const AudioManager = require('./audio');
// const ContainerTemplate = require('./template');

const {
    cacheElements
} = Lib.dom;

class AudioContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'audio',
            // template: ContainerTemplate
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

    template () {
        return `
            <div class="container_header">
                <div id="audio_player">
                    <div class="button" id="audio_player_play_pause">PAUSE</div>
                    <div class="button" id="audio_player_loop">LOOP: ON</div>

                    <div id="audio_player_volume"></div>

                    <div class="button" id="choose_audio_directory">Choose Audio Directory</div>

                    <div id="audio_player_progress">
                        <div id="audio_player_current_time"></div>
                        <div id="audio_player_progress_played"></div>
                        <div id="audio_player_now_playing"></div>
                        <div id="audio_player_duration"></div>
                    </div>
                </div>
            </div>

            <div class="container_body">
                <div id="no_audio_screen" class="help_screen">
                    <div id="no_audio_screen_load" class="help_screen_action">
                        <div class="help_screen_main_text">CLICK TO PICK AUDIO FOLDER</div>
                    </div>
                </div>

                <div id="tracks_section" class="section">
                    <div class="section_title">tracks</div>
                    <div id="tracks_body" class="section_body"></div>
                </div>

                <div id="search_section" class="section">
                    <div class="section_title">search</div>
                    <div id="search_input_wrap">
                        <input id="search_input" class="text_input" type="text" placeholder="ENTER TRACK/TAG/FOLDER (tracks under matching folder included)"></input>
                    </div>
                    <div id="search_body" class="section_body"></div>
                </div>

                <div id="previous_section" class="section">
                    <div class="section_title">
                        <span>previously played</span>
                        <div id="clear_previous">CLEAR</div>
                    </div>
                    <div id="previous_body" class="section_body"></div>
                </div>
            </div>
        `;
    }
};

module.exports = AudioContainer;
