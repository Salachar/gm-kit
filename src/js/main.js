const Store = require('./store');
window.Store = Store;

const SoundManager = require('./sound_manager');
const QuadrantManager = require('./quadrant_manager');
const ToastMesseger = require('./toast');
const Mouse = require('./mouse');

const MapContainer = require('./containers/map/main');
const InfoContainer = require('./containers/info/main');
const AudioContainer = require('./containers/audio/main');
const LightsContainer = require('./containers/lights/main');
const TriggersContainer = require('./containers/triggers/main');

const {
    getWindowDimensions
} = require('./helpers');

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
    }

    setActiveContainer (container) {
        for (let c in this.containers) {
            this.containers[c].setDisabled();
        }
        container.setActive();
        this.active_container = container;
    }

    setRadioState (selected_radio) {
        let radio_inputs =  document.getElementsByClassName('radio_snap');
        for (let i = 0; i < radio_inputs.length; ++i) {
            radio_inputs[i].classList.remove('checked');
        }
        selected_radio.classList.add('checked');
    }

    setEvents () {
        window.addEventListener('message', (e) => {
            let event = e.data;
            if (event.event === 'display_window_loaded') {
                this.showInDisplayWindow();
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
    window.Mouse = new Mouse();
    window.AppManager = new AppManager();
};

window.onresize = () => {
    getWindowDimensions();
};
