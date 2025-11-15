const electron = require('electron');
const IPC = electron.ipcRenderer;

let KEY_DOWN = {};

const KEYS = {
  MINUS: 189,
  PLUS: 187,
  DELETE: 8,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  ESC: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  L: 76,
  O: 79,
  R: 82,
  S: 83,
  T: 84,
  W: 87,
  Z: 90,
  QUESTION: 191, // Doesn't require shift, technically is "/"
  LEFT_BRACKET: 219,
  RIGHT_BRACKET: 221,
};

let CONFIG = {
  window: 'gm_screen',
  is_player_screen: false,

  window_width: null,
  window_height: null,

  canvas_actions: false,

  max_map_size: 3000,

  snap: {
    indicator: {
      show: false,
      point: null,
      segment: null,
    },
    distance: 10,
    color: '#FF0000',
  },

  create_door: false,

  door_grab_dist: 20,

  move_point_dist: 10,

  move_mode: false,

  quick_place: false,

  params: {},

  display: {
    door: {
      outer_color: '#FF0000',
      outer_width: 3,
      inner_color: '#FFFFFF',
      inner_width: 1,
    },
    wall: {
      place_color: '#FF0000',
      outer_color: '#0000FF',
      outer_width: 3,
      inner_color: '#FFFFFF',
      inner_width: 1,
      highlight_outer_color: '#FF00FF',
      highlight_outer_width: 6,
      highlight_inner_color: '#FFFFFF',
      highlight_inner_width: 2,
    },
    fog: {
      gm_screen: {
        seen: {
          color: 'rgba(40, 40, 40, 1)',
          opacity: 0.5,
        },
        hidden: {
          color: 'rgba(20, 20, 20, 1)',
          opacity: 0.7,
        }
      },
      player_screen: {
        seen: {
          color: 'rgba(40, 40, 40, 1)',
          opacity: 0.9,
        },
        hidden: {
          color: 'rgba(20, 20, 20, 1)',
          opacity: 1,
        }
      }
    }
  }
};

let window_search = window.location.search;
window_search = window_search.replace('?', '');
window_search = window_search.split('&');
window_search.forEach((param) => {
  param = param.split('=');
  CONFIG.params[param[0]] = param[1];
});
