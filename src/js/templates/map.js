class MapTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
                <div id="controls">
                    <div id="load_files" class="button">Load</div>
                    <div id="load_state" class="button">Load State</div>

                    <div class="button_spacer"></div>

                    <div id="save_map" class="button">Save</div>
                    <div id="save_all_maps" class="button">Save All</div>
                    <div id="save_state" class="button">Save State</div>

                    <div class="button_spacer"></div>

                    <div class="checkbox_container">
                        <div id="create_one_way_wall" class="checkbox"></div>
                        <div class="checkbox_label">One-Way</div>
                    </div>

                    <div id="help" class="button">Help</div>
                </div>

                <div id="help_box" class="hide">
                    <table id="help_table">
                        <tr>
                            <th class="help_key">Key</th>
                            <th></th>
                        </tr>
                    </table>
                </div>

                <div id="text_block_container">
                    <div class="text_block_header">
                        <div class="text_block_header_buttons">
                            <div id="text_block_save" class="button">SAVE</div>
                            <div id="text_block_delete" class="button">DELETE</div>
                        </div>
                        <div id="text_block_close"></div>
                    </div>
                    <div class="text_block_body">
                        <textarea id="text_block_textarea"></textarea>
                    </div>
                </div>

                <div id="map_tabs"></div>
            </div>

            <div class="container_body">
                <div id="no_map_screen">
                    <div id="no_map_screen_load">CLICK TO<br>LOAD MAP</div>
                </div>

                <div id="map_container"></div>

                <div id="map_list_modal_wrap" class="hidden">
                    <div id="map_list_modal" class="modal">
                        <div class="modal_header">
                            <div class="modal_title">
                                <span class="modal_title_info">&#9432;</span>
                                <span class="modal_title_text">Select Map:</span>
                            </div>
                            <div class="modal_header_buttons">
                                <input id="map_list_search" type="text" class="text_input"></input>
                                <div id="map_list_modal_folder" class="button">MAP DIRECTORY</div>
                                <div id="map_list_modal_open" class="button">OPEN SELECTED</div>
                            </div>
                            <div id="map_list_modal_close" class="modal_close"></div>
                        </div>
                        <div id="map_list_modal_body" class="modal_body">
                            <div id="map_list_modal_body_preview"></div>
                            <div id="map_list_modal_body_list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

module.exports = MapTemplate;
