const Store = require('./lib/store');
window.Store = Store;

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

const NumberInput = require('./lib/inputs/numberInput');

const {
    getWindowDimensions,
} = Lib.helpers;

const {
    listener,
} = Lib.dom;

class AppManager {
    constructor () {
        this.el_html = document.getElementsByTagName('html')[0];
        this.render();

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

        getWindowDimensions();

        this.setEvents();

        Store.register({
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

    getFontSize () {
        const html_styles = getComputedStyle(this.el_html);
        const html_font_size = html_styles.getPropertyValue('font-size');
        const font_size = parseInt(html_font_size, 10);
        return font_size;
    }

    setEvents () {
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

        IPC.on('message', (e, message = {}) => {
            const { type = 'message' } = message;
            Toast[type](message.text);
        });
    }

    render () {
        Lib.dom.generate([
            ['div #set_directory .hidden HTML=SET DIRECTORY', {
                oncreate: (node) => {
                    const directory_set = CONFIG.params.data_dir === 'true';
                    if (!directory_set) node.classList.remove('hidden');
                },
                click: (e) => {
                    IPC.send('choose_main_directory');
                }
            }],
            ['div #toast'],
            ['div #header', [
                ['div #tabs'],
                new NumberInput("#ui_scale", {
                    step: 0.5,
                    min: 7,
                    default_value: this.getFontSize(),
                    store_key: "ui_scale",
                    store_event: "ui_scale_change"
                })
            ]],
            ['div #containers']
        ], this, document.getElementById('root'));
    }
}

window.onload = () => {
    console.log(CONFIG);

    IPC.send('app_loaded');

    IPC.on('config', (e, config_json) => {
        // TODO: More than a flat level copy over for CONFIG
        // Object assign or some shit
        for (let c in config_json) {
            CONFIG[c] = config_json[c];
        }

        window.AppManager = new AppManager();

        window.SoundManager = new SoundManager();
        window.QuadrantManager = new QuadrantManager();
        window.Toast = new ToastMesseger();
        window.Mouse = new Mouse();
    });
};

window.onresize = () => {
    getWindowDimensions();
};
