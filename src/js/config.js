const electron = require('electron');
const IPC = electron.ipcRenderer;
const $ = require('jquery');

const KEY_DOWN = {};

const KEYS = {
    MINUS: 189,
    PLUS: 187,
    SHIFT: 16,
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
    LEFT_BRACKET: 219,
    RIGHT_BRACKET: 221,
};

let CONFIG = {
    window: 'control',
    is_display: false,

    window_width: null,
    window_height: null,

    snap: {
        line: false,
        end: false,
        indicator: {
            show: false,
            x: 0,
            y: 0
        },
        distance: 10,
        color: '#FF0000'
    },

    create_door: false,

    door_grab_dist: 20,

    quick_place: false,

    params: {},

    scroll_speed: 50,

    display: {
        door: {
            outer_color: '#FF0000',
            outer_width: 4,
            inner_color: '#FFFFFF',
            inner_width: 1
        },
        wall: {
            place_color: '#FF0000',
            outer_color: '#0000FF',
            outer_width: 4,
            inner_color: '#FFFFFF',
            inner_width: 1,
            highlight_outer_color: '#FF00FF',
            highlight_outer_width: 6,
            highlight_inner_color: '#FFFFFF',
            highlight_inner_width: 2,
        },
        fog: {
            control: {
                seen: {
                    color: 'rgba(40, 40, 40, 1)',
                    opacity: 0.5
                },
                hidden: {
                    color: 'rgba(20, 20, 20, 1)',
                    opacity: 0.7
                }
            },
            display: {
                seen: {
                    color: 'rgba(40, 40, 40, 1)',
                    opacity: 0.9
                },
                hidden: {
                    color: 'rgba(20, 20, 20, 1)',
                    opacity: 1
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
