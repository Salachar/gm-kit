// class AudioTemplate {
//     constructor (data = {}) {
//         this.__data = data;
//     }

//     generate () {
//         return `
//             <div class="container_header">
//                 <div id="audio_player">
//                     <div class="button" id="audio_player_play_pause">PAUSE</div>
//                     <div class="button" id="audio_player_loop">LOOP: ON</div>

//                     <div id="audio_player_volume"></div>

//                     <div class="button" id="choose_audio_directory">Choose Audio Directory</div>

//                     <div id="audio_player_progress">
//                         <div id="audio_player_current_time"></div>
//                         <div id="audio_player_progress_played"></div>
//                         <div id="audio_player_now_playing"></div>
//                         <div id="audio_player_duration"></div>
//                     </div>
//                 </div>
//             </div>

//             <div class="container_body">
//                 <div id="no_audio_screen" class="help_screen">
//                     <div id="no_audio_screen_load" class="help_screen_action">
//                         <div class="help_screen_main_text">CLICK TO PICK AUDIO FOLDER</div>
//                     </div>
//                 </div>

//                 <div id="tracks_section" class="section">
//                     <div class="section_title">tracks</div>
//                     <div id="tracks_body" class="section_body"></div>
//                 </div>

//                 <div id="search_section" class="section">
//                     <div class="section_title">search</div>
//                     <div id="search_input_wrap">
//                         <input id="search_input" class="text_input" type="text" placeholder="ENTER TRACK/TAG/FOLDER (tracks under matching folder included)"></input>
//                     </div>
//                     <div id="search_body" class="section_body"></div>
//                 </div>

//                 <div id="previous_section" class="section">
//                     <div class="section_title">
//                         <span>previously played</span>
//                         <div id="clear_previous">CLEAR</div>
//                     </div>
//                     <div id="previous_body" class="section_body"></div>
//                 </div>
//             </div>
//         `;
//     }
// }

// module.exports = AudioTemplate;