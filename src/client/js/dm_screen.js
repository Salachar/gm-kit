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
const ConfigContainer = require('./pages/config');

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
        active: true,
      }),
      info: new InfoContainer({
        parent: this,
      }),
      audio: new AudioContainer({
        parent: this,
      }),
      config: new ConfigContainer({
        parent: this,
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
      const key = e.keyCode;
      const zooming = (key === KEYS.PLUS || key === KEYS.MINUS);
      if (KEY_DOWN[key] && !zooming) return;
      KEY_DOWN[key] = true;
      this.active_container.keyDown(key);
    }, {prevent_default: false});

    listener(document.body, 'keyup', (e) => {
      KEY_DOWN[e.keyCode] = false;
      this.active_container.keyUp(e.keyCode);
    }, {prevent_default: true});

    IPC.on('message', (e, message = {}) => {
      const { type = 'message' } = message;
      Toast[type](message.text);
    });

    IPC.on('json_directory_chosen', (e) => {
      this.refs.choose_json_directory.classList.add('hidden');
    });
  }

  render () {
    Lib.dom.generate([
      ['div #choose_json_directory .help_screen .hidden', {
        oncreate: (node) => {
          const directory_set = CONFIG.params.data_dir === 'true';
          if (!directory_set) node.classList.remove('hidden');
        },
        styles: {
          zIndex: 9999,
        },
      }, [
        ['div .help_screen_action', {
          click: (e) => IPC.send('choose_json_directory'),
        }, [
          ['div .help_screen_main_text HTML=CLICK TO CHOOSE SAVE FOLDER'],
          ['div .help_screen_support_text HTML=This is where audio and map data will be saved (all .json files)'],
        ]]
      ]],

      ['div #toast'],
      ['div #header', [
        ['div #tabs'],
        new NumberInput("#ui_scale .inline", {
          text: 'UI Size',
          step: 0.5,
          min: 7,
          interval: 300,
          default_value: this.getFontSize(),
          store_key: "ui_scale",
          store_event: "ui_scale_change",
        }),
      ]],
      ['div #containers'],
    ], this, document.getElementById('root'));
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
