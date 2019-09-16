const {
    cacheElements,
    createElement
} = require('../../lib/dom');

const {
    setValue,
    numberInput,
    arrowInput,
    radioInput
} = require('../../lib/input');

const controls = require('./controls');

class ControlsManager {
    constructor (opts = {}) {
        this.node = document.getElementById('map_controls_container');

        this.open = false;

        const cache_list = [
            'map_controls_toggle',
            'common_hotkeys',
            'show_player_screen',
            'show_entire_map',
            'grid_toggle',
            'grid_size_container',
            'grid_shift',
            'scroll_buttons',
            'map_zoom',
            'player_screen_brightness',
            'spell_marker_size',
            'spell_marker_shape',
        ];

        cacheElements(this, cache_list);

        this.addCommonHotKeys();
        this.setEvents();
    }

    toggle () {
        this.open = !this.open;
        if (this.open) {
            Store.fire('show_map_controls');
        } else {
            Store.fire('hide_map_controls');
        }
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
        this.el_map_controls_toggle.addEventListener('click', (e) => {
            this.toggle();
        });

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

        numberInput(this.el_spell_marker_size, {
            step: 5,
            init: 20,
            store_key: 'spell_marker_size'
        });

        radioInput(this.el_spell_marker_shape, {
            options: [
                { value: 'line' },
                { value: 'square' },
                { value: 'circle' },
                { value: 'cone' }
            ],
            store_key: 'spell_marker_shape'
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

        [...document.getElementsByClassName('map_control_section')].forEach((section) => {
            // console.log(header);

            const header = section.getElementsByClassName('map_control_section_header')[0];
            const body = section.getElementsByClassName('map_control_section_body')[0];

            if (!header || !body) return;

            header.addEventListener('click', (e) => {
                body.classList.toggle('hidden');
            });
        });
    }
}

module.exports = ControlsManager;
