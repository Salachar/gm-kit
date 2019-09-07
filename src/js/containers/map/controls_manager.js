const {
    cacheElements,
    createElement
} = require('../../lib/dom');

const {
    setValue,
    numberInput,
    arrowInput
} = require('../../lib/input');

const controls = require('./controls');

class ControlsManager {
    constructor (opts = {}) {
        this.el_text_block_container = document.getElementById('map_controls_container');

        this.open = false;

        const cache_list = [
            'common_hotkeys',
            'show_player_screen',
            'show_entire_map',
            'grid_toggle',
            'grid_size_container',
            'grid_shift',
            'scroll_buttons',
            'map_zoom',
            'player_screen_brightness'
        ];

        cacheElements(this, cache_list);

        this.addCommonHotKeys();
        this.setEvents();
    }

    show () {
        this.open = true;
    }

    close () {
        this.open = false;
    }

    update (map) {
        setValue(this.el_grid_size_container, map.CanvasManager.grid.size);
        // Not saved to map data, but tracked during the application session between maps
        setValue(this.el_map_zoom, map.player_screen_zoom);
        setValue(this.el_player_screen_brightness, map.CanvasManager.brightness);
    }

    addCommonHotKeys () {
        controls.forEach((control) => {
            if (!control.common) return;
            let hotkeys = createElement('div', 'hotkey_section', {
                addTo: this.el_common_hotkeys
            });
            createElement('span', 'hotkey_key', {
                html: control.key + ':',
                addTo: hotkeys
            });
            createElement('span', 'hotkey_desc', {
                html: control.text,
                addTo: hotkeys
            });
        });
    }

    setEvents () {
        this.el_show_player_screen.addEventListener('click', (e) => {
            Store.fire('show_player_screen');
        });

        this.el_show_entire_map.addEventListener('click', (e) => {
            Store.fire('show_entire_map');
        });

        this.el_grid_toggle.addEventListener('click', (e) => {
            Store.fire('toggle_grid_(ps)');
        });

        numberInput(this.el_grid_size_container, {
            handler: (value) => {
                Store.fire('grid_size_update_(ps)', {
                    size: value
                });
            }
        });

        arrowInput(this.el_grid_shift, {
            step: 1,
            handler: (offset) => {
                Store.fire('grid_offset_update_(ps)', {
                    offset: offset
                });
            }
        });

        arrowInput(this.el_scroll_buttons, {
            step: 2,
            interval: 10,
            handler: (offset) => {
                Store.fire('scroll_(PS)', {
                    offset: offset
                });
            }
        });

        numberInput(this.el_map_zoom, {
            step: 0.025,
            interval: 20,
            handler: (value) => {
                Store.fire('zoom_(ps)', {
                    zoom: value
                });
            }
        });

        numberInput(this.el_player_screen_brightness, {
            min: 0,
            max: 200,
            interval: 30,
            handler: (value) => {
                Store.fire('brightness_(ps)', {
                    brightness: value
                })
            }
        });
    }
}

module.exports = ControlsManager;
