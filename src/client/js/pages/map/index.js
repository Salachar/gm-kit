const Container = require('../base');

const ControlsManager = require('./managers/controls_manager');
const HelpManager = require('./managers/help_manager');
const MapListManager = require('./managers/map_list_manager');
const TextManager = require('./managers/text_manager');

const Checkbox = require('../../lib/inputs/checkbox');

const MapInstance = require('./instance');
const Lib = require('../../lib');

const {
    resetSnap,
} = Lib.helpers;

class MapContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'map',
            render: false,
        });

        this.maps = {};
        this.current_map = null;

        this.TextManager = new TextManager();
        this.ControlsManager = new ControlsManager();
        // this.HelpManager = new HelpManager();

        Store.register({
            'mouse_leave': this.onMouseLeave.bind(this),
            'show_map_controls': this.showMapControls.bind(this),
            'hide_map_controls': this.hideMapControls.bind(this)
        });

        this.render();
    }

    showMapControls () {
        this.refs.map_main_section.classList.add('open');
    }

    hideMapControls () {
        this.refs.map_main_section.classList.remove('open');
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
        const tabs = document.getElementById('map_tabs');
        const { name } = map;
        Lib.dom.generate([`div .map_tab HTML=${name}`, {
            oncreate: (node) => {
                this.maps[name].tab = node;
            },
            click: (e) => {
                if (e.defaultPrevented) return;
                this.setActiveMap(name);
            },
        }, [
            ['div .map_tab_close', {
                click: (e) => {
                    e.preventDefault();
                    this.removeMap(name);
                }
            }]
        ]], null, tabs);
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

    render () {
        Lib.dom.generate([
            ['div .container_header', [
                ['div #controls', [
                    // ['div', '#help .button', {
                    //     html: 'Help'
                    // }],
                    // new HelpManager().render(),

                    ['div .button_spacer'],
                    ['div #load_files .button HTML=Load', {
                        click: (e) => {
                            IPC.send('load_maps');
                        }
                    }],
                    ['div #load_state .button HTML=Load State', {
                        click: (e) => {
                            // if (!this.current_map) return;
                            // this.current_map.loadState();
                            Toast.message('Save/Load State is temporarily disabled');
                        }
                    }],
                    ['div .button_spacer'],
                    ['div #save_map .button HTML=Save'],
                    ['div #save_all_maps .button HTML=Save All'],
                    ['div #save_state .button HTML=Save State'],
                    ['div .button_spacer'],
                    new Checkbox('create_one_way_wall', {
                        text: 'One-Way Wall (modify existing wall)',
                        store_key: 'create_one_way_wall',
                        store_event: 'create_one_way_wall_toggled',
                    }),
                ]],

                // Help Manager gets created and added
                // new HelpManager().render(),

                // Text Manager gets created and added
                this.TextManager.render(),

                ['div #map_tabs'],
            ]],
            ['div .container_body', [
                ['div #map_main_section', [
                    ['div #no_map_screen .help_screen', [
                        ['div #no_map_screen_load .help_screen_action', {
                            click: (e) => {
                                IPC.send('load_maps');
                            }
                        }, [
                            ['div .help_screen_main_text HTML=CLICK TO LOAD MAP'],
                            ['div .help_screen_support_text HTML=If you have not selected a map folder, you will be prompted to'],
                        ]]
                    ]],
                    ['div #map_containers HTML=CLICK TO LOAD MAP'],

                    this.ControlsManager.render(),

                    new MapListManager({
                        onMapLoad: this.onMapLoad.bind(this)
                    }).render(),
                ]]
            ]]
        ], this, this.node);
    }
}

module.exports = MapContainer;