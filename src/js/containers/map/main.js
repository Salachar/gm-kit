const Container = require('../base');
const ContainerTemplate = require('../../templates/map');

const MapListManager = require('./map_list_manager');
const MapInstance = require('./instance/map');
const TextManager = require('./text_manager');
const ControlsManager = require('./controls_manager');

const controls = require('./controls');

const {
    createElement,
    resetSnap
} = require('../../lib/helpers');

class MapContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'map',
            template: ContainerTemplate
        });

        this.maps = {};
        this.current_map = null;

        this.el_map_main_section = document.getElementById('map_main_section');
        this.el_tabs = document.getElementById('map_tabs');
        this.el_help_table = document.getElementById('help_table');

        this.MapListManager = new MapListManager({
            onMapLoad: this.onMapLoad.bind(this)
        });

        this.TextManager = new TextManager();
        this.ControlsManager = new ControlsManager();

        this.setEvents();
        this.addHelp();

        Store.register({
            'mouse_leave': this.onMouseLeave.bind(this),
            'show_player_screen': this.showPlayerScreen.bind(this),
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
                Store.fire('move_segment_toggled');
                break;
            case KEYS.SHIFT:
                this.enableSegmentQuickPlace();
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
                this.disableSegmentQuickPlace();
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
        CONFIG.move_segment = true;
        CONFIG.quick_place = false;
    }

    disableSegmentMove () {
        CONFIG.move_segment = false;
        CONFIG.quick_place = false;
    }

    enableSegmentQuickPlace () {
        CONFIG.move_segment = false;
        CONFIG.quick_place = true;
    }

    disableSegmentQuickPlace () {
        CONFIG.move_segment = false;
        CONFIG.quick_place = false;
    }

    showPlayerScreen () {
        let current_map_data =  (this.current_map || {}).full_data || {};

        if (window.player_screen && !window.player_screen.closed) {
            window.player_screen.postMessage({
                event: 'display_map',
                data: current_map_data,
                config: CONFIG
            });
            Store.fire('zoom_(ps)', {
                zoom: current_map_data.meta.zoom
            });
            Store.fire('brightness_(ps)', {
                brightness: current_map_data.meta.brightness
            });
            return;
        }

        const window_options = {
            // autoHideMenuBar: 1,
            // titleBarStyle: 'hidden',
            width: 800,
            height: 600,
            top: 360,
            left: 10,
        };

        let option_param = '';
        for (let x in window_options) {
            option_param += x + '=' + window_options[x] + ','
        }

        window.player_screen = window.open(
            '../html/player_screen.html',
            'electron',
            option_param
        );

        // Clear all key downs, key ups dont register properly when a new
        // window open and the old one loses focus
        KEY_DOWN = {};
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
        Store.clearData();
        if (this.current_map) {
            this.current_map.active = false;
            this.current_map.hide();
        }
        this.current_map = this.maps[map_name];
        this.current_map.active = true;
        this.current_map.show();
        this.ControlsManager.update(this.current_map);
        window.MAP = this.current_map;
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

        if (window.player_screen && !window.player_screen.closed) {
            window.player_screen.postMessage({
                event: 'remove_map',
                data: map_name
            });
        }

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

        document.getElementById('create_one_way_wall').addEventListener('click', (e) => {
            CONFIG.create_one_way_wall = !CONFIG.create_one_way_wall;
            if (CONFIG.create_one_way_wall) {
                e.currentTarget.classList.add('checked');
            } else {
                e.currentTarget.classList.remove('checked');
            }
            Store.fire('create_one_way_wall_toggled');
        });

        document.getElementById('help').addEventListener('click', (e) => {
            document.getElementById('help_box').classList.toggle('hide');
        });
    }

    addHelp () {
        controls.forEach((control) => {
            let help_control = createElement('tr', 'help_section', {
                addTo: this.el_help_table
            });
            createElement('td', 'help_key', {
                html: control.key,
                addTo: help_control
            });
            createElement('td', 'help_desc', {
                html: control.text,
                addTo: help_control
            });
        });
    }
}

module.exports = MapContainer;
