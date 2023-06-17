const Store = require('./lib/store');
window.Store = Store;

const Lib = require('./lib');
window.Lib = Lib;

const Mouse = require('./lib/mouse');

const SoundManager = require('./managers/sound_manager');
const QuadrantManager = require('./managers/quadrant_manager');
const MapInstance = require('./pages/map/instance');

const {
  getWindowDimensions
} = Lib.helpers;

class DisplayManager {
  constructor () {
    this.maps = {};
    this.current_map = null;

    this.setEvents();
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
    this.maps[map.name] = new MapInstance(map);
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
      const data = e.data;
      if (data.event === 'display_map') {
        this.onMapLoad(data.data);
        return;
      }
      if (data.event === 'remove_map') {
        this.removeMap(data.data);
        return;
      }
      if (data.event === 'store_data_set') {
        return Store.set(data.data);
      }
      Store.fire(e.data.event, e.data.data, e.data.key);
    });

    document.body.addEventListener('keydown', (e) => {
      // Currently only allow + or - for zooming on the player map
      let key = e.keyCode;
      if (key === KEYS.PLUS || key === KEYS.MINUS) {
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

  window.opener.postMessage({
    event: 'player_screen_loaded'
  });
};

window.onunload = function (e) {
  window.opener.postMessage({
    event: 'player_screen_unloaded'
  });
 }

window.onresize = () => {
  getWindowDimensions();
};

