const SoundManager = require('./sound_manager');
const QuadrantManager = require('./quadrant_manager');
const MapInstance = require('./map/map');
const ToastMesseger = require('./toast');
const Mouse = require('./mouse');

const getWindowDimensions = require('./helpers').getWindowDimensions;
const createElement = require('./helpers').createElement;

let scroll_timer = null;
let scroll_wait_timer = null;

const SCROLL_FREQUENCY = 50;
const SCROLL_WAIT_TIME = 1000;

class DisplayManager {
    constructor () {
        this.maps = {};
        this.current_map = null;

        this.setEvents();
    }

    onEvent (event, data, opts) {
        opts = opts || {};
        let { no_propagate, map_name } = opts;
        map_name = map_name || (this.current_map || {}).name;

        if (event === 'dim_down' || event === 'dim_up') {
            let dimmer_opacity = parseFloat(document.getElementById('dimmer').style.opacity, 10);
            let dimmer_mod = (event === 'dim_down') ? -0.01 : 0.01;
            let new_dimmer_opacity = dimmer_opacity + dimmer_mod;
            if (new_dimmer_opacity < 0) new_dimmer_opacity = 0;
            if (new_dimmer_opacity > 1) new_dimmer_opacity = 1;
            document.getElementById('dimmer').style.opacity = new_dimmer_opacity;
        }

        if (this.current_map && map_name && this.current_map.name === map_name) {
            this.current_map.onEvent(event, data);
        }
    }

    onMapLoad (map) {
        this.addMap(map);
        this.setActiveMap(map.name);
    }

    setActiveMap (map_name) {
        if (this.current_map) {
            this.current_map.active = false;
            this.current_map.hide();
        }
        this.current_map = this.maps[map_name];
        window.current_map = this.current_map;
        this.current_map.active = true;
        this.current_map.show();
    }

    addMap (map) {
        if (this.maps[map.name]) return;
        this.maps[map.name] = new MapInstance(map);
        this.maps[map.name].hide();
    }

    // removeMap (map_name) {
    //     let removing_current_map = (this.current_map.name === map_name);
    //     this.maps[map_name].shutdown();
    //     delete this.maps[map_name];

    //     let map_keys = Object.keys(this.maps);
    //     if (removing_current_map && map_keys.length) {
    //         this.setActiveMap(map_keys[map_keys.length - 1]);
    //     }
    //     if (!map_keys.length) {
    //         document.getElementById('no_map_screen').classList.remove('hidden');
    //     }
    // }

    setEvents () {
        IPC.on('display_map', (e, map = {}) => {
            this.onMapLoad(map);
        });

        window.addEventListener('message', (e) => {
            let event = e.data;

            if (event.event === 'display_map') {
                this.onMapLoad(event.data);
                return;
            }

            this.onEvent(event.event, event.data.data, {
                map_name: event.data.map_name
            });
        });

        document.getElementById('map_scroll_top').addEventListener('mouseover', (e) => {
            scroll_wait_timer = setTimeout(() => {
                scroll_timer = setInterval(() => {
                    fireEvent('scroll_up');
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
                    fireEvent('scroll_right');
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
                    fireEvent('scroll_down');
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
                    fireEvent('scroll_left');
                }, SCROLL_FREQUENCY);
            }, SCROLL_WAIT_TIME);
        });
        document.getElementById('map_scroll_left').addEventListener('mouseleave', (e) => {
            clearInterval(scroll_timer);
            clearTimeout(scroll_wait_timer);
        });

        document.body.addEventListener('keydown', (e) => {
            let key = e.keyCode;
            if (key === KEYS.PLUS || key === KEYS.MINUS || key === KEYS.LEFT || key === KEYS.UP || key === KEYS.DOWN || key === KEYS.RIGHT ) {
                if (this.current_map) {
                    this.current_map.onKeyDown(key);
                }
            }
        });
    }
}

$(document).ready(() => {
    DISPLAY_WINDOW = true;

    window.SoundManager = new SoundManager();
    window.QuadrantManager = new QuadrantManager();
    window.Toast = new ToastMesseger();
    window.DisplayManager = new DisplayManager();
    window.Mouse = new Mouse();

    document.getElementById('dimmer').style.opacity = 0;

    window.fireEvent = (event, data) => {
        window.DisplayManager.onEvent(event, data);
    }

    window.opener.postMessage({
        event: 'display_window_loaded'
    });
});

$(window).resize(function () {
    getWindowDimensions();
});

