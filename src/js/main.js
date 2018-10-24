const Store = require('./store');

const FileManager = require('./file_manager');
const SoundManager = require('./sound_manager');
const QuadrantManager = require('./quadrant_manager');
const MapInstance = require('./map/map');
const ToastMesseger = require('./toast');
const Mouse = require('./mouse');

const getWindowDimensions = require('./helpers').getWindowDimensions;
const createElement = require('./helpers').createElement;

const controls = require('./controls');

let scroll_timer = null;
let scroll_wait_timer = null;

const SCROLL_FREQUENCY = 50;
const SCROLL_WAIT_TIME = 1000;

class MapManager {
    constructor () {
        this.FileManager = new FileManager({
            onMapLoad: this.onMapLoad.bind(this)
        });

        this.maps = {};
        this.current_map = null;

        this.el_tabs = document.getElementById('map_tabs');
        this.el_help_table = document.getElementById('help_table');

        this.el_map_scroll_top = document.getElementById('map_scroll_top');
        this.el_map_scroll_right = document.getElementById('map_scroll_right');
        this.el_map_scroll_bottom = document.getElementById('map_scroll_bottom');
        this.el_map_scroll_left = document.getElementById('map_scroll_left');

        getWindowDimensions();
        this.setEvents();
        this.addHelp();

        Store.register({
            'hide_scroller': this.onHideScroller.bind(this),
            'show_scroller': this.onShowScroller.bind(this)
        });
    }

    onHideScroller (data) {
        this[`el_map_scroll_${data.scroller}`].classList.add('hidden');
    }

    onShowScroller (data) {
        this[`el_map_scroll_${data.scroller}`].classList.remove('hidden');
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
        Store.clear();
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
            Store.key = null;
            Store.clear();
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
        for (let m in this.maps) {
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
        let current_map_data =  (this.current_map || {}).data || {};

        if (window.display_window && !window.display_window.closed) {
            window.display_window.postMessage({
                event: 'display_map',
                data: current_map_data
            });
            return;
        }

        const window_options = {
            autoHideMenuBar: 1,
            titleBarStyle: 'hidden',
            width: 800,
            height: 600,
            top: 360,
            left: 10,
        };

        let option_param = '';
        for (let x in window_options) {
            option_param += x + '=' + window_options[x] + ','
        }

        window.display_window =  window.open(
            '../html/display.html',
            'electron',
            option_param
        );

        // Clear all key downs, key ups dont register properly when a new
        // window open and the old one loses focus
        KEY_DOWN = {};
    }

    addHelp () {
        // <tr class="help_section">
        //     <td class="help_key">SHIFT</td>
        //     <td class="help_desc">Hold down to allow quick placement of walls</td>
        // </tr>
        controls.forEach((control) => {
            let help_control = createElement('tr', 'help_section', {
                addTo: this.el_help_table
            });
            createElement('td', 'help_key', {
                html: control.key,
                addTo: help_control
            });
            createElement('td', 'help_key', {
                html: control.text,
                addTo: help_control
            });
        });
    }

    setEvents () {
        window.addEventListener('message', (e) => {
            let event = e.data;
            if (event.event === 'display_window_loaded') {
                this.showInDisplayWindow();
                return;
            }
        });

        document.getElementById('map_scroll_top').addEventListener('mouseover', (e) => {
            scroll_wait_timer = setTimeout(() => {
                scroll_timer = setInterval(() => {
                    Store.fire('scroll_up');
                }, SCROLL_FREQUENCY);
            }, SCROLL_WAIT_TIME);
        });
        document.getElementById('map_scroll_top').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
            clearTimeout(scroll_wait_timer);
        });

        document.getElementById('map_scroll_right').addEventListener('mouseover', (e) => {
            scroll_wait_timer = setTimeout(() => {
                scroll_timer = setInterval(() => {
                    Store.fire('scroll_right');
                }, SCROLL_FREQUENCY);
            }, SCROLL_WAIT_TIME);
        });
        document.getElementById('map_scroll_right').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
            clearTimeout(scroll_wait_timer);
        });

        document.getElementById('map_scroll_bottom').addEventListener('mouseover', (e) => {
            scroll_wait_timer = setTimeout(() => {
                scroll_timer = setInterval(() => {
                    Store.fire('scroll_down');
                }, SCROLL_FREQUENCY);
            }, SCROLL_WAIT_TIME);
        });
        document.getElementById('map_scroll_bottom').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
            clearTimeout(scroll_wait_timer);
        });

        document.getElementById('map_scroll_left').addEventListener('mouseover', (e) => {
            scroll_wait_timer = setTimeout(() => {
                scroll_timer = setInterval(() => {
                    Store.fire('scroll_left');
                }, SCROLL_FREQUENCY);
            }, SCROLL_WAIT_TIME);
        });
        document.getElementById('map_scroll_left').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
            clearTimeout(scroll_wait_timer);
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

        document.body.addEventListener('keydown', (e) => {
            e.preventDefault();

            KEY_DOWN[e.keyCode] = true;

            switch (e.keyCode) {
                case KEYS.CONTROL:
                    CONFIG.move_segment = true;
                    CONFIG.quick_place = false;
                    Store.fire('move_segment_toggled');
                    break;
                case KEYS.SHIFT:
                    CONFIG.move_segment = false;
                    CONFIG.quick_place = true;
                    break;
                case KEYS.LEFT_BRACKET:
                    Store.fire('dim_down');
                    break;
                case KEYS.RIGHT_BRACKET:
                    Store.fire('dim_up');
                    break;
                case KEYS.S:
                    if (KEY_DOWN[KEYS.ALT]) {
                        this.showInDisplayWindow();
                    }
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
                case KEYS.CONTROL:
                    CONFIG.move_segment = false;
                    break;
                case KEYS.SHIFT:
                    CONFIG.quick_place = false;
                    break;
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
    }
}

window.onload = () => {
    window.SoundManager = new SoundManager();
    window.QuadrantManager = new QuadrantManager();
    window.Toast = new ToastMesseger();
    window.MapManager = new MapManager();
    window.Mouse = new Mouse();
};

window.onresize = () => {
    getWindowDimensions();
};

