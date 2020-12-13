const Container = require('../base');

const MapListManager = require('./map_list_manager');
const MapInstance = require('./instance/map');
const TextManager = require('./text_manager');
const ControlsManager = require('./controls_manager');
const PlayerScreenManager = require('./player_screen_manager');
const HelpManager = require('./help_manager');

const {
    createElement,
    resetSnap
} = require('../../lib/helpers');

const {
    checkboxInput
} = require('../../lib/input');

class MapContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'map',
        });

        this.maps = {};
        this.current_map = null;

        this.el_map_main_section = document.getElementById('map_main_section');
        this.el_tabs = document.getElementById('map_tabs');

        this.MapListManager = new MapListManager({
            onMapLoad: this.onMapLoad.bind(this)
        });

        this.TextManager = new TextManager();
        this.ControlsManager = new ControlsManager();
        this.HelpManager = new HelpManager();

        this.setEvents();

        Store.register({
            'mouse_leave': this.onMouseLeave.bind(this),
            'show_map_controls': this.showMapControls.bind(this),
            'hide_map_controls': this.hideMapControls.bind(this)
        });
    }

    showMapControls () {
        this.el_map_main_section.classList.add('open');
    }

    hideMapControls () {
        this.el_map_main_section.classList.remove('open');
    }

    onMouseLeave () {
        // Currently these do the same, probably will always remain redundant
        this.disableSegmentMove();
        this.disableSegmentQuickPlace();
    }

    onKeyDown (keyCode) {
        switch (keyCode) {
            case KEYS.CONTROL:
                this.enableSegmentMove();
                Store.fire('move_mode_toggled');
                break;
            case KEYS.SHIFT:
                if (Store.get('spell_marker_shape') && !Store.get('show_affected_tiles_checked')) {
                    Store.fire('show_affected_tiles_toggled-(ps)', {
                        'show_affected_tiles': true
                    });
                } else {
                    this.enableSegmentQuickPlace();
                }
                break;
            case KEYS.LEFT_BRACKET:
                Store.fire('dim_down');
                break;
            case KEYS.RIGHT_BRACKET:
                Store.fire('dim_up');
                break;
            case KEYS.S:
                if (KEY_DOWN[KEYS.ALT]) {
                    Store.fire('show_player_screen');
                }
            default:
                // console.log('APP >> Keydown: Unhandled keyCode: ' + keyCode);
                break;
        }

        if (this.current_map) {
            this.current_map.onKeyDown(keyCode);
        }
    }

    onKeyUp (keyCode) {
        switch (keyCode) {
            case KEYS.CONTROL:
                this.disableSegmentMove();
                break;
            case KEYS.SHIFT:
                if (Store.get('spell_marker_shape') && !Store.get('show_affected_tiles_checked')) {
                    Store.fire('show_affected_tiles_toggled-(ps)', {
                        'show_affected_tiles': false
                    });
                } else {
                    this.disableSegmentQuickPlace();
                }
                break;
            default:
                // console.log('APP >> Keyup: Unhandled keyCode: ' + e.keyCode);
                break;
        }

        if (this.current_map) {
            this.current_map.onKeyUp(keyCode);
        }
    }

    enableSegmentMove () {
        CONFIG.move_mode = true;
        CONFIG.quick_place = false;
    }

    disableSegmentMove () {
        CONFIG.move_mode = false;
        CONFIG.quick_place = false;
    }

    enableSegmentQuickPlace () {
        CONFIG.move_mode = false;
        CONFIG.quick_place = true;
    }

    disableSegmentQuickPlace () {
        CONFIG.move_mode = false;
        CONFIG.quick_place = false;
    }

    onMapLoad (maps) {
        let map_keys = Object.keys(maps);
        if (!map_keys.length) return;

        let map = null
        for (let i = 0; i < map_keys.length; ++i) {
            map = maps[map_keys[i]];
            this.addMap(map);
        }

        this.setActiveMap(map_keys[map_keys.length - 1]);
        document.getElementById('no_map_screen').classList.add('hidden');
    }

    setActiveMap (map_name) {
        Store.key = map_name;

        if (this.current_map) {
            this.current_map.active = false;
            this.current_map.hide();
        }

        this.current_map = this.maps[map_name];
        this.current_map.active = true;
        this.current_map.show();
        this.ControlsManager.update(this.current_map);

        Store.set({
            current_map_data: (this.current_map || {}).full_data || {}
        })
    }

    addMap (map) {
        if (this.maps[map.name]) {
            Toast.message(`Map "${map.name}" is already loaded`);
            return;
        }
        this.maps[map.name] = new MapInstance(map, {
            manager: this
        });
        this.addMapTab(map);
        this.maps[map.name].hide();
    }

    removeMap (map_name) {
        let removing_current_map = (this.current_map.name === map_name);
        Store.remove(map_name);
        resetSnap();

        Store.fire('player_screen_remove_map', {
            map_name: map_name
        });

        this.maps[map_name].shutdown();
        delete this.maps[map_name];

        let map_keys = Object.keys(this.maps);
        if (removing_current_map && map_keys.length) {
            this.setActiveMap(map_keys[map_keys.length - 1]);
        }

        if (!map_keys.length) {
            Store.clearKeys();
            document.getElementById('no_map_screen').classList.remove('hidden');
        }
    }

    addMapTab (map) {
        ((map) => {
            const map_name = map.name;
            let new_tab = createElement('div', 'map_tab', {
                html: map_name,
                events: {
                    click: (e) => { // Left click
                        if (e.defaultPrevented) return;
                        this.setActiveMap(map_name);
                    },
                    contextmenu: (e) => { // Right click
                        if (e.defaultPrevented) return;
                        this.removeMap(map_name);
                    }
                },
                addTo: this.el_tabs
            });
            this.maps[map_name].tab = new_tab;

            createElement('div', 'map_tab_close', {
                events: {
                    click: (e) => {
                        e.preventDefault();
                        this.removeMap(map_name);
                    }
                },
                addTo: new_tab
            });
        })(map);
    }

    getMapData () {
        if (!this.current_map) return;
        let map_data = {};
        map_data[this.current_map.name] = this.current_map.data;
        return map_data;
    }

    getMapStateData () {
        if (!this.current_map) return;
        let state_data = this.current_map.state;
        return state_data;
    }

    getAllMapData () {
        if (!Object.keys(this.maps).length) return;
        let map_data = {};
        for (let m in this.maps) {
            map_data[this.maps[m].name] = this.maps[m].data;
        }
        return map_data;
    }

    setEvents () {
        document.getElementById('load_state').addEventListener('click', (e) => {
            // if (!this.current_map) return;
            // this.current_map.loadState();
            Toast.message('Save/Load State is temporarily disabled');
        });

        checkboxInput(document.getElementById('create_one_way_wall'), {
            store_key: 'create_one_way_wall',
            store_event: 'create_one_way_wall_toggled'
        });
    }

    template () {
        return `
            <div class="container_header">
                <div id="controls">
                    <div id="help" class="button">Help</div>

                    <div class="button_spacer"></div>

                    <div id="load_files" class="button">Load</div>
                    <div id="load_state" class="button">Load State</div>

                    <div class="button_spacer"></div>

                    <div id="save_map" class="button">Save</div>
                    <div id="save_all_maps" class="button">Save All</div>
                    <div id="save_state" class="button">Save State</div>

                    <div class="button_spacer"></div>

                    <div class="checkbox_container">
                        <div id="create_one_way_wall" class="checkbox"></div>
                        <div class="checkbox_label">One-Way Wall (modify existing wall)</div>
                    </div>
                </div>

                ${HelpManager.template()}
                ${TextManager.template()}

                <div id="map_tabs"></div>
            </div>

            <div class="container_body">
                <div id="map_main_section">
                    <div id="no_map_screen" class="help_screen">
                        <div id="no_map_screen_load" class="help_screen_action">
                            <div class="help_screen_main_text">CLICK TO LOAD MAP</div>
                            <div class="help_screen_support_text">If you have not selected a map folder, you will be prompted to</div>
                        </div>
                    </div>

                    <div id="map_containers"></div>

                    <div id="map_controls_container">
                        <div id="map_controls_toggle" class="menu_icon">
                            <div class="menu_icon_bar menu_icon_bar_1"></div>
                            <div class="menu_icon_bar menu_icon_bar_2"></div>
                            <div class="menu_icon_bar menu_icon_bar_3"></div>
                        </div>

                        ${ControlsManager.template()}
                    </div>
                </div>

                ${MapListManager.template()}
            </div>
        `;
    }
}

module.exports = MapContainer;
