// const TextManager = require('../containers/map/text_manager');

// class MapTemplate {
//     constructor (data = {}) {
//         this.__data = data;
//     }

//     generate () {
//         return `
//             <div class="container_header">
//                 <div id="controls">
//                     <div id="help" class="button">Help</div>

//                     <div class="button_spacer"></div>

//                     <div id="load_files" class="button">Load</div>
//                     <div id="load_state" class="button">Load State</div>

//                     <div class="button_spacer"></div>

//                     <div id="save_map" class="button">Save</div>
//                     <div id="save_all_maps" class="button">Save All</div>
//                     <div id="save_state" class="button">Save State</div>

//                     <div class="button_spacer"></div>

//                     <div class="checkbox_container">
//                         <div id="create_one_way_wall" class="checkbox"></div>
//                         <div class="checkbox_label">One-Way Wall (modify existing wall)</div>
//                     </div>
//                 </div>

//                 <div id="help_box" class="hide">
//                     <table id="help_table">
//                         <tr>
//                             <th class="help_key">Key</th>
//                             <th></th>
//                         </tr>
//                     </table>
//                 </div>

//                 ` + TextManager.template() + `

//                 <div id="map_tabs"></div>
//             </div>

//             <div class="container_body">
//                 <div id="map_main_section">
//                     <div id="no_map_screen" class="help_screen">
//                         <div id="no_map_screen_load" class="help_screen_action">
//                             <div class="help_screen_main_text">CLICK TO LOAD MAP</div>
//                             <div class="help_screen_support_text">If you have not selected a map folder, you will be prompted to</div>
//                         </div>
//                     </div>

//                     <div id="map_containers"></div>

//                     <div id="map_controls_container">
//                         <div id="map_controls_toggle" class="menu_icon">
//                             <div class="menu_icon_bar menu_icon_bar_1"></div>
//                             <div class="menu_icon_bar menu_icon_bar_2"></div>
//                             <div class="menu_icon_bar menu_icon_bar_3"></div>
//                         </div>

//                         <div id="map_controls_body">
//                             <div class="map_control_section">
//                                 <div class="map_control_section_header">Common Hotkeys</div>
//                                 <div id="common_hotkeys" class="map_control_section_body">
//                                     <div class="button_text">Common Hotkeys used during sessions</div>
//                                 </div>
//                             </div>

//                             <div class="map_control_section">
//                                 <div class="map_control_section_body">
//                                     <div class="button_text">Show the current map on the Player Screen. This will also create the Player Screen window if it doesn't exist</div>
//                                     <div id="show_player_screen" class="button">Show on Player Screen</div>
//                                 </div>
//                             </div>

//                             <div class="map_control_section">
//                                 <div class="map_control_section_body">
//                                     <div class="button_text">Ignores all walls and lights up the entire map on the Player Screen</div>
//                                     <div id="show_entire_map" class="button">Show Entire Map</div>
//                                 </div>
//                             </div>

//                             <div class="map_control_section">
//                                 <div class="map_control_section_header">Grid Overlay</div>

//                                 <div class="map_control_section_body">
//                                     <div class="button_text">Overlay a grid onto the map, this will show on both the GM and Player Screen. Saving the map will save the current grid settings.</div>
//                                     <div id="grid_toggle" class="button">Toggle Grid</div>

//                                     <div class="button_text">Change the grid size (pixels)</div>
//                                     <div id="grid_size_container" class="number_input_container">
//                                         <div class="number_input_button arrow_left"></div>
//                                         <input type="text" class="number_input" value="50"></input>
//                                         <div class="number_input_button arrow_right"></div>
//                                     </div>

//                                     <div class="button_text">Shift the overlayed grid</div>
//                                     <div id="grid_shift" class="arrow_buttons">
//                                         <div class="arrow_button arrow_left"></div>
//                                         <div class="arrow_button arrow_top"></div>
//                                         <div class="arrow_button arrow_bottom"></div>
//                                         <div class="arrow_button arrow_right"></div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div class="map_control_section">
//                                 <div class="map_control_section_header">Spell/Shape Markers</div>

//                                 <div class="map_control_section_body">
//                                     <div class="button_text">Currently only useable with overlay grid enabled</div>
//                                     <div id="spell_marker_size" class="number_input_container">
//                                         <div class="number_input_button arrow_left"></div>
//                                         <input type="text" class="number_input"></input>
//                                         <div class="number_input_button arrow_right"></div>
//                                     </div>

//                                     <div id="spell_marker_shape" class="radio_input"></div>
//                                     <div id="spell_marker_color" class="color_picker"></div>

//                                     <div class="button_text">Will cause a performance drop only while placing markers</div>
//                                     <div class="checkbox_container">
//                                         <div id="show_affected_tiles" class="checkbox"></div>
//                                         <div class="checkbox_label">Show grid cells affected by spells</div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div class="map_control_section">
//                                 <div class="map_control_section_header">Player Screen Controls</div>

//                                 <div class="map_control_section_body">
//                                     <div id="toggle_map_fit" class="button">Toggle Map Fit</div>

//                                     <div class="button_text">Scroll the Player Screen</div>
//                                     <div id="scroll_buttons" class="arrow_buttons">
//                                         <div class="arrow_button arrow_left"></div>
//                                         <div class="arrow_button arrow_top"></div>
//                                         <div class="arrow_button arrow_bottom"></div>
//                                         <div class="arrow_button arrow_right"></div>
//                                     </div>

//                                     <div class="map_section_spacer"></div>

//                                     <div class="button_text">Zoom the Player Screen</div>
//                                     <div id="map_zoom" class="number_input_container">
//                                         <div class="number_input_button arrow_left"></div>
//                                         <input type="text" class="number_input" value="1"></input>
//                                         <div class="number_input_button arrow_right"></div>
//                                     </div>

//                                     <div class="map_section_spacer"></div>

//                                     <div class="button_text">Dim the Player Screen (aritifical screen brightness)</div>
//                                     <div id="player_screen_brightness" class="number_input_container">
//                                         <div class="number_input_button arrow_left"></div>
//                                         <input type="text" class="number_input" value="100"></input>
//                                         <div class="number_input_button arrow_right"></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div id="map_list_modal_wrap" class="hidden">
//                     <div id="map_list_modal" class="modal">
//                         <div class="modal_header">
//                             <div class="modal_title">
//                                 <span class="modal_title_info">&#9432;</span>
//                                 <span class="modal_title_text">Select Map:</span>
//                             </div>
//                             <div class="modal_header_buttons">
//                                 <input id="map_list_search" type="text" class="text_input"></input>
//                                 <div id="map_list_modal_folder" class="button">MAP DIRECTORY</div>
//                                 <div id="map_list_modal_open" class="button">OPEN SELECTED</div>
//                             </div>
//                             <div id="map_list_modal_close" class="modal_close"></div>
//                         </div>
//                         <div id="map_list_modal_body" class="modal_body">
//                             <div id="map_list_modal_body_preview"></div>
//                             <div id="map_list_modal_body_list"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// }

// module.exports = MapTemplate;


