const FileManager = require('./file_manager');
const SoundManager = require('./sound_manager');
const QuadrantManager = require('./quadrant_manager');
const MapInstance = require('./map/map');
const ToastMesseger = require('./toast');
const Mouse = require('./mouse');

const getWindowDimensions = require('./helpers').getWindowDimensions;
const createElement = require('./helpers').createElement;

let scroll_timer = null;
const SCROLL_FREQUENCY = 50;

class MapManager {
    constructor () {
        this.FileManager = new FileManager({
            onMapLoad: this.onMapLoad.bind(this)
        });

        this.maps = {};
        this.current_map = null;

        this.el_tabs = document.getElementById('map_tabs');

        getWindowDimensions();
        this.setEvents();
    }

    onEvent (event, data) {
        switch (event) {
            default:
                // console.log('MapManager >> Event "' + event + '" not handled');
                break;
        }

        if (this.current_map) {
            this.current_map.onEvent(event, data);
        }
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
        if (this.current_map) {
            this.current_map.active = false;
            this.current_map.hide();
        }
        this.current_map = this.maps[map_name];
        this.current_map.active = true;
        this.current_map.show();
    }

    addMap (map) {
        if (this.maps[map.name]) {
            Toast.message(`Map "${map.name}" is already loaded`);
            return;
        }
        this.maps[map.name] = new MapInstance(map);
        this.addMapTab(map);
        this.maps[map.name].hide();
    }

    removeMap (map_name) {
        let removing_current_map = (this.current_map.name === map_name);
        this.maps[map_name].shutdown();
        delete this.maps[map_name];

        let map_keys = Object.keys(this.maps);
        if (removing_current_map && map_keys.length) {
            this.setActiveMap(map_keys[map_keys.length - 1]);
        }
        if (!map_keys.length) {
            document.getElementById('no_map_screen').classList.remove('hidden');
        }
    }

    addMapTab (map) {
        ((map) => {
            const map_name = map.name;
            let new_tab = createElement('div', 'map_tab', {
                html: map_name,
                events: {
                    click: (e) => {
                        if (e.defaultPrevented) return;
                        this.setActiveMap(map_name);
                    }
                },
                addTo: this.el_tabs
            });
            this.maps[map_name].tab = new_tab;

            let new_tab_close = createElement('div', 'map_tab_close', {
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

    getAllMapData () {
        if (!Object.keys(this.maps).length) return;
        let map_data = {};
        for (var m in this.maps) {
            map_data[this.maps[m].name] = this.maps[m].data;
        }
        return map_data;
    }

    setRadioState (selected_radio) {
        let radio_inputs =  document.getElementsByClassName('radio_snap');
        for (let i = 0; i < radio_inputs.length; ++i) {
            radio_inputs[i].classList.remove('checked');
        }
        selected_radio.classList.add('checked');
    }

    showInDisplayWindow () {
        console.log('showInDisplayWindow');
        let current_map_data =  (this.current_map || {}).data || {};

        if (window.display_window && !window.display_window.closed) {
            window.display_window.postMessage({
                event: 'display_map',
                data: current_map_data
            });
            return;
        }

        window.display_window =  window.open('../html/display.html', 'electron', 'autoHideMenuBar=1,titleBarStyle=hidden' );

        // IPC.send('display_window', (this.current_map || {}).data || {});
    }

    setEvents () {
        window.addEventListener('message', (e) => {
            let event = e.data;

            console.log(e);
            if (event.event === 'display_window_loaded') {
                console.log('stuff');
                this.showInDisplayWindow();
                return;
            }
        });

        document.getElementById('map_scroll_top').addEventListener('mouseover', (e) => {
            scroll_timer = setInterval(() => {
                fireEvent('scroll_up');
            }, SCROLL_FREQUENCY);
        });
        document.getElementById('map_scroll_top').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
        });

        document.getElementById('map_scroll_right').addEventListener('mouseover', (e) => {
            scroll_timer = setInterval(() => {
                fireEvent('scroll_right');
            }, SCROLL_FREQUENCY);
        });
        document.getElementById('map_scroll_right').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
        });

        document.getElementById('map_scroll_bottom').addEventListener('mouseover', (e) => {
            scroll_timer = setInterval(() => {
                fireEvent('scroll_down');
            }, SCROLL_FREQUENCY);
        });
        document.getElementById('map_scroll_bottom').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
        });

        document.getElementById('map_scroll_left').addEventListener('mouseover', (e) => {
            scroll_timer = setInterval(() => {
                fireEvent('scroll_left');
            }, SCROLL_FREQUENCY);
        });
        document.getElementById('map_scroll_left').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
        });

        document.getElementById('wall_snap_end').addEventListener('click', (e) => {
            CONFIG.snap.line = false;
            CONFIG.snap.end = true;
            this.setRadioState(e.currentTarget);
        });

        document.getElementById('wall_snap_line').addEventListener('click', (e) => {
            CONFIG.snap.line = true;
            CONFIG.snap.end = false;
            this.setRadioState(e.currentTarget);
        });

        document.getElementById('wall_snap_none').addEventListener('click', (e) => {
            CONFIG.snap.line = false;
            CONFIG.snap.end = false;
            this.setRadioState(e.currentTarget);
        });

        document.getElementById('create_door').addEventListener('click', (e) => {
            CONFIG.create_door = !CONFIG.create_door;
            if (CONFIG.create_door) {
                e.currentTarget.classList.add('checked');
            } else {
                e.currentTarget.classList.remove('checked');
            }
        });

        document.getElementById('help').addEventListener('click', (e) => {
            document.getElementById('help_box').classList.toggle('hide');
        });

        document.body.addEventListener('keydown', (e) => {
            e.preventDefault();

            KEY_DOWN[e.keyCode] = true;

            switch (e.keyCode) {
                case KEYS.SHIFT:
                     CONFIG.quick_place = true;
                    break;
                case KEYS.LEFT_BRACKET:
                    fireEvent('dim_down');
                    break;
                case KEYS.RIGHT_BRACKET:
                    fireEvent('dim_up');
                    break;
                default:
                    // console.log('APP >> Keydown: Unhandled keyCode: ' + e.keyCode);
                    break;
            }

            if (this.current_map) {
                this.current_map.onKeyDown(e.keyCode);
            }
        });

        document.body.addEventListener('keyup', (e) => {
            e.preventDefault();

            KEY_DOWN[e.keyCode] = false;

            switch (e.keyCode) {
                case KEYS.SHIFT:
                    CONFIG.quick_place = false;
                    break;
                case KEYS.S:
                    this.showInDisplayWindow();
                default:
                    // console.log('APP >> Keyup: Unhandled keyCode: ' + e.keyCode);
                    break;
            }

            if (this.current_map) {
                this.current_map.onKeyUp(e.keyCode);
            }
        });

        IPC.on('message', (e, message = {}) => {
            switch (message.type) {
                case 'success':
                    Toast.success(message.text);
                    break;
                case 'error':
                    Toast.error(message.text);
                    break;
                default:
                    Toast.message(message.text);
                    break;
            }
        });

        // IPC.on('event', (e, event) => {
        //     // console.log(event);
        // });
    }
}

$(document).ready(() => {
    window.SoundManager = new SoundManager();
    window.QuadrantManager = new QuadrantManager();
    window.Toast = new ToastMesseger();
    window.MapManager = new MapManager();
    window.Mouse = new Mouse();

    const no_propogate = {
        'image_loaded': true,
        'first_light_link_placed': true,
        'second_light_link_placed': true,
        'enable_light': true,
        'disable_light': true,
        'place_link': false,
        'cancel_placements': true,
        'switch_wall_door': false,
        'quick_place_started': true,
        'quick_place_ended': true,
        'toggle_closest_door': false,
        'add_light': false,
        'add_segment': false,
        'light_moved': true,
        'light_added': true,
        'light_move': false,
        'lights_cleared': false,
        'select_light': false,
        'deselect_light': false,
        'select_door': false,
        'deselect_door': false,
        'door_drag': false,
        'door_activated': false,
        'draw_walls': false,
        'remove_closest': false,
        'remove_light': false,
        'remove_wall': false,
        'remove_door': false,
        'remove_light_link': false,
        'scroll_left': 'ALT',
        'scroll_right': 'ALT',
        'scroll_up': 'ALT',
        'scroll_down': 'ALT',
    };

    window.fireEvent = (event, data) => {
        window.MapManager.onEvent(event, data);

        // Don't send the event if it is ALT-able and ALT isnt down.
        if (no_propogate[event] === 'ALT' && !KEY_DOWN[KEYS.ALT]) return;

        // Don't send the event if we don't want it to propogate at all.
        if (no_propogate[event] === true) return;

        if (window.display_window) {
            window.display_window.postMessage({
                window: CONFIG.params.window,
                event: event,
                data: {
                    map_name: window.MapManager.current_map.name,
                    data: data
                }
            });
        }

        // IPC.send('event', {
        //     window: CONFIG.params.window,
        //     event: event,
        //     data: {
        //         map_name: window.MapManager.current_map.name,
        //         data: data
        //     }
        // });
    }
});

$(window).resize(function () {
    getWindowDimensions();
});

