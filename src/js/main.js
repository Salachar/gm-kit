const Store = require('./lib/store');
window.Store = Store;

const ToastMesseger = require('./lib/toast');
const Mouse = require('./lib/mouse');

const SoundManager = require('./sound_manager');
const QuadrantManager = require('./quadrant_manager');

const MapContainer = require('./containers/map/main');
const InfoContainer = require('./containers/info/main');
const AudioContainer = require('./containers/audio/main');
const LightsContainer = require('./containers/lights/main');
const TriggersContainer = require('./containers/triggers/main');

const {
    getWindowDimensions
} = require('./lib/helpers');

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
            lights: new LightsContainer({
                parent: this
            }),
            triggers: new TriggersContainer({
                parent: this
            })
        };

        getWindowDimensions();

        this.setEvents();

        Store.register({
            'save_map': this.saveMap.bind(this),
        });
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
        if (!map_data) {
            Toast.error('There is no map to save');
            return;
        }
        IPC.send('save_map', map_data);
    }

    setEvents () {
        window.addEventListener('message', (e) => {
            let event = e.data;
            if (event.event === 'player_screen_loaded') {
                this.containers.map.showPlayerScreen();
                return;
            }
        });

        document.body.addEventListener('keydown', (e) => {
            // e.preventDefault();
            KEY_DOWN[e.keyCode] = true;
            this.active_container.keyDown(e.keyCode);
        });

        document.body.addEventListener('keyup', (e) => {
            e.preventDefault();
            KEY_DOWN[e.keyCode] = false;
            this.active_container.keyUp(e.keyCode);
        });

        document.getElementById('save_map').addEventListener('click', (e) => {
            this.saveMap();
        });

        document.getElementById('save_all_maps').addEventListener('click', (e) => {
            const map_data = this.containers.map.getAllMapData();
            if (!map_data) {
                Toast.error('There are no maps to save');
                return;
            }
            IPC.send('save_map', map_data);
        });

        document.getElementById('save_state').addEventListener('click', (e) => {
            // const map = this.containers.map.current_map;
            // const map_data = this.containers.map.getMapData();
            // const state_data = this.containers.map.getMapStateData();
            // map_data[map.name].json.state = state_data;
            // IPC.send('save_map', map_data);
            Toast.message('Save/Load State is temporarily disabled');
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
    IPC.send('app_loaded');

    IPC.on('config', (e, config_json) => {
        // TODO: More than a flat level copy over for CONFIG
        // Object assign or some shit
        for (let c in config_json) {
            CONFIG[c] = config_json[c];
        }

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
