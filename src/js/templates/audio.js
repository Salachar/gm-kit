class AudioTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        // <div id="audio_player_volume_container">
        //     <input id="audio_player_volume" value="0.1" type="range" min="0" max="1" step="0.01" />
        // </div>
        return `
            <div class="container_header">
                <div id="audio_player">
                    <div class="button" id="audio_player_play_pause">PAUSE</div>
                    <div class="button" id="audio_player_loop">LOOP: ON</div>

                    <div id="audio_player_volume" class="number_input_container">
                        <div class="number_input_button arrow_left"></div>
                        <input type="text" class="number_input" value="50"></input>
                        <div class="number_input_button arrow_right"></div>
                    </div>

                    <div id="audio_player_progress">
                        <div id="audio_player_current_time"></div>
                        <div id="audio_player_progress_played"></div>
                        <div id="audio_player_now_playing"></div>
                        <div id="audio_player_duration"></div>
                    </div>
                </div>
            </div>

            <div class="container_body">
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
}

module.exports = AudioTemplate;