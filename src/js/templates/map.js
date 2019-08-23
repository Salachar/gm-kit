class MapTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div id="controls">
                <div id="load_files" class="button">Load</div>
                <div id="load_state" class="button">Load State</div>

                <div class="button_spacer"></div>

                <div id="save_map" class="button">Save</div>
                <div id="save_all_maps" class="button">Save All</div>
                <div id="save_state" class="button">Save State</div>

                <div class="button_spacer"></div>

                <div id="create_one_way_wall" class="checkbox"></div>
                <div class="checkbox_label">One-Way</div>

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

            <div id="map_tabs"></div>

            <div id="no_map_screen">
                <div id="no_map_screen_load">CLICK TO<br>LOAD MAP</div>
            </div>

            <div id="map_container"></div>

            <div id="map_list_modal_wrap" class="hidden">
                <div id="map_list_modal">
                    <div id="map_list_modal_header" class="modal_header">
                        <span id="map_dir_location">&#9432;</span>
                        Select Map:
                        <div id="map_list_modal_open" class="button">OPEN SELECTED</div>
                        <div id="map_list_modal_folder" class="button">MAP DIRECTORY</div>
                        <input id="map_list_search" type="text" class="input"></input>
                        <div id="map_list_modal_close"></div>
                    </div>
                    <div id="map_list_modal_body">
                        <div id="map_list_modal_body_preview"></div>
                        <div id="map_list_modal_body_list"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

module.exports = MapTemplate;