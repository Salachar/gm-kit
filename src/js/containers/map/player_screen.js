const Store = require('../../lib/store');
window.Store = Store;

const Mouse = require('../../lib/mouse');
const SoundManager = require('../../sound_manager');
const QuadrantManager = require('../../quadrant_manager');
const MapInstance = require('./instance/map');

const {
    getWindowDimensions
} = require('../../lib/helpers');

class DisplayManager {
    constructor () {
        this.maps = {};
        this.current_map = null;

        this.setEvents();

        Store.register({
            'dim_down': this.onDimDown.bind(this),
            'dim_up': this.onDimUp.bind(this),
        });
    }

    onDimDown () {
        this.setDim(-0.01);
    }

    onDimUp () {
        this.setDim(0.01);
    }

    setDim (dimmer_mod) {
        console.log('setdim');
        let dimmer_opacity = parseFloat(document.getElementById('dimmer').style.opacity, 10);
        let new_dimmer_opacity = dimmer_opacity + dimmer_mod;
        if (new_dimmer_opacity < 0) new_dimmer_opacity = 0;
        if (new_dimmer_opacity > 1) new_dimmer_opacity = 1;
        document.getElementById('dimmer').style.opacity = new_dimmer_opacity;
    }

    onMapLoad (map) {
        this.addMap(map);
        this.setActiveMap(map.name);
        Store.fire('light_poly_update', {
            polys: map.lights_data.polys
        });
    }

    setActiveMap (map_name) {
        Store.key = map_name;
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
        // If lighting is not enabled on the main screen, do not load fog data, as it
        // would be invalid
        this.maps[map.name] = new MapInstance(map, {
            // load_fog: (map.lights_data.enabled) ? map.json.state.fog : null
            load_fog: map.json.state.fog
        });
        this.maps[map.name].hide();
    }

    removeMap (map_name) {
        Store.remove(map_name);
        this.maps[map_name].shutdown();
        delete this.maps[map_name];
        let map_keys = Object.keys(this.maps);
        if (!map_keys.length) {
            Store.key = null;
            Store.clear();
        }
    }

    setEvents () {
        window.addEventListener('message', (e) => {
            console.log(e);
            const data = e.data;
            if (data.event === 'display_map') {
                this.onMapLoad(data.data);
                return;
            }
            if (data.event === 'remove_map') {
                this.removeMap(data.data);
                return;
            }
            Store.fire(e.data.event, e.data.data, e.data.key);
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

window.onload = () => {
    CONFIG.is_player_screen = true;
    CONFIG.window = 'player_screen';

    window.SoundManager = new SoundManager();
    window.QuadrantManager = new QuadrantManager();
    window.DisplayManager = new DisplayManager();
    window.Mouse = new Mouse();

    document.getElementById('dimmer').style.opacity = 0;

    window.opener.postMessage({
        event: 'display_window_loaded'
    });
};

window.onresize = () => {
    getWindowDimensions();
};
