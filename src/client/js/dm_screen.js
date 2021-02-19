const Store = require('./lib/store');
window.Store = Store;

// const DOM = require('./lib/dom');
const Lib = require('./lib');
window.Lib = Lib;

const ToastMesseger = require('./lib/toast');
const Mouse = require('./lib/mouse');

const PlayerScreenManager = require('./managers/player_screen_manager');
const SoundManager = require('./managers/sound_manager');
const QuadrantManager = require('./managers/quadrant_manager');

const MapContainer = require('./pages/map');
const InfoContainer = require('./pages/info');
const AudioContainer = require('./pages/audio');

const {
    getWindowDimensions,
} = Lib.helpers;

const {
    listener,
} = Lib.dom;

const {
    numberInput,
} = Lib.input;

class AppManager {
    constructor () {
        this.active_container = null;

        this.containers = {
            map: new MapContainer({
                parent: this,
                active: true
            }),
            info: new InfoContainer({
                parent: this
            }),
            audio: new AudioContainer({
                parent: this
            }),
        };

        this.el_html = document.getElementsByTagName('html')[0];

        getWindowDimensions();

        this.setEvents();

        Store.register({
            'save_map': this.saveMap.bind(this),
            "ui_scale_change": this.onUIScaleChange.bind(this)
        });
    }

    onUIScaleChange (data) {
        const new_scale = data.ui_scale;
        if (typeof new_scale !== 'number') return;
        this.el_html.style.fontSize = new_scale + 'px'
    }

    setActiveContainer (container) {
        for (let c in this.containers) {
            this.containers[c].setDisabled();
        }
        container.setActive();
        this.active_container = container;
    }

    saveMap () {
        const map_data = this.containers.map.getMapData();
        if (!map_data) return Toast.error('There is no map to save');
        IPC.send('save_map', map_data);
    }

    setEvents () {
        const html_styles = getComputedStyle(this.el_html);
        const html_font_size = html_styles.getPropertyValue('font-size');
        const font_size = parseInt(html_font_size, 10);

        numberInput("ui_scale", {
            step: 0.5,
            min: 7,
            init: font_size,
            store_key: "ui_scale",
            store_event: "ui_scale_change"
        });

        listener(window, 'message', (e) => {
            const event = (e.data || {}).event;
            if (!event) return;
            Store.fire(event);
        });

        listener(document.body, 'keydown', (e) => {
            if (KEY_DOWN[e.keyCode]) return;
            KEY_DOWN[e.keyCode] = true;
            this.active_container.keyDown(e.keyCode);
        }, {prevent_default: false});

        listener(document.body, 'keyup', (e) => {
            KEY_DOWN[e.keyCode] = false;
            this.active_container.keyUp(e.keyCode);
        }, {prevent_default: true});

        listener('save_map', 'click', (e) => {
            this.saveMap();
        });

        listener('save_all_maps', 'click', (e) => {
            const map_data = this.containers.map.getAllMapData();
            if (!map_data) return Toast.error('There are no maps to save');
            IPC.send('save_map', map_data);
        });

        listener('save_state', 'click', (e) => {
            // const map = this.containers.map.current_map;
            // const map_data = this.containers.map.getMapData();
            // const state_data = this.containers.map.getMapStateData();
            // map_data[map.name].json.state = state_data;
            // IPC.send('save_map', map_data);
            Toast.message('Save/Load State is temporarily disabled');
        });

        IPC.on('message', (e, message = {}) => {
            const { type = 'message' } = message;
            Toast[type](message.text);
        });
    }
}

window.onload = () => {
    IPC.send('app_loaded');

    IPC.on('config', (e, config_json) => {
        // TODO: More than a flat level copy over for CONFIG
        // Object assign or some shit
        for (let c in config_json) {
            CONFIG[c] = config_json[c];
        }

        // window.DOM = DOM;

        window.SoundManager = new SoundManager();
        window.QuadrantManager = new QuadrantManager();
        window.Toast = new ToastMesseger();
        window.Mouse = new Mouse();
        window.AppManager = new AppManager();
    });
};

window.onresize = () => {
    getWindowDimensions();
};
