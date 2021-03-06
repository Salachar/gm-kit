const {
    listener,
    cacheElements,
    createElement
} = require('../../lib/dom');

const {
    setValue,
    numberInput,
    arrowInput,
    radioInput,
    colorPicker,
    checkboxInput,
    deselect
} = require('../../lib/input');

const HelpManager = require('./help_manager');

class ControlsManager {
    constructor (opts = {}) {
        this.node = document.getElementById('map_controls_container');

        this.open = false;

        cacheElements(this, [
            'grid_size_container',
            'map_zoom',
            'player_screen_brightness',
            'spell_marker_shape',
        ]);

        this.addCommonHotKeys();
        this.setEvents();

        Store.register({
            'deselect_spell_marker': this.deselectSpellMarker.bind(this),
        });
    }

    deselectSpellMarker () {
        deselect(this.el_spell_marker_shape);
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
        setValue(this.el_grid_size_container, map.managers.canvas.canvases.grid.attributes.size);
        // Not saved to map data, but tracked during the application session between maps
        setValue(this.el_map_zoom, map.player_screen_zoom);
        setValue(this.el_player_screen_brightness, map.managers.canvas.canvases.image.brightness);
    }

    addCommonHotKeys () {
        HelpManager.getHelpInfo().forEach((help_item) => {
            if (!help_item.common) return;
            let hotkeys = createElement('div', 'hotkey_section', {
                addTo: 'common_hotkeys'
            });
            createElement('span', 'hotkey_key', {
                html: help_item.key + ':',
                addTo: hotkeys
            });
            createElement('span', 'hotkey_desc', {
                html: help_item.text,
                addTo: hotkeys
            });
        });
    }

    setEvents () {
        listener('map_controls_toggle', 'click', (e) => {
            this.toggle();
        });

        listener('show_player_screen', 'click', (e) => {
            Store.fire('show_player_screen');
        });

        listener('show_entire_map', 'click', (e) => {
            Store.fire('show_entire_map');
        });

        listener('grid_toggle', 'click', (e) => {
            Store.fire('toggle_grid_(ps)');
        });

        listener('toggle_map_fit', 'click', (e) => {
            Store.fire('toggle_map_fit-(PS)');
        });

        numberInput('grid_size_container', {
            step: 0.25,
            init: 50,
            store_key: 'size',
            store_event: 'grid_size_update_(ps)'
        });

        arrowInput('grid_shift', {
            step: 1,
            store_key: 'offset',
            store_event: 'grid_offset_update_(ps)'
        });

        numberInput('spell_marker_size', {
            step: 5,
            init: 20,
            store_key: 'spell_marker_size'
        });

        radioInput('spell_marker_shape', {
            options: ['line', 'square', 'circle', 'cone'],
            store_key: 'spell_marker_shape',
            store_event: 'spell_marker_shape_updated-(ps)'
        });

        colorPicker('spell_marker_color', {
            store_key: 'spell_marker_color'
        });

        checkboxInput('show_affected_tiles', {
            store_key: 'show_affected_tiles show_affected_tiles_checked',
            store_event: 'show_affected_tiles_toggled-(ps)'
        });

        arrowInput('scroll_buttons', {
            step: 2,
            interval: 10,
            store_key: 'offset',
            store_event: 'scroll_(PS)'
        });

        numberInput('map_zoom', {
            step: 0.025,
            interval: 20,
            store_key: 'zoom',
            store_event: 'zoom_(ps)'
        });

        numberInput('player_screen_brightness', {
            min: 0,
            max: 200,
            init: 100,
            interval: 30,
            store_key: 'brightness',
            store_event: 'brightness_(ps)'
        });

        [...document.getElementsByClassName('map_control_section')].forEach((section) => {
            const header = section.getElementsByClassName('map_control_section_header')[0];
            const body = section.getElementsByClassName('map_control_section_body')[0];
            if (!header || !body) return;
            header.addEventListener('click', (e) => {
                body.classList.toggle('hidden');
            });
        });
    }

    static template () {
        return `
            <div id="map_controls_body">
                <div class="map_control_section">
                    <div class="map_control_section_header">Common Hotkeys</div>
                    <div id="common_hotkeys" class="map_control_section_body">
                        <div class="button_text">Common Hotkeys used during sessions</div>
                    </div>
                </div>

                <div class="map_control_section">
                    <div class="map_control_section_body">
                        <div class="button_text">Show the current map on the Player Screen. This will also create the Player Screen window if it doesn't exist</div>
                        <div id="show_player_screen" class="button">Show on Player Screen</div>
                    </div>
                </div>

                <div class="map_control_section">
                    <div class="map_control_section_body">
                        <div class="button_text">Ignores all walls and lights up the entire map on the Player Screen</div>
                        <div id="show_entire_map" class="button">Show Entire Map</div>
                    </div>
                </div>

                <div class="map_control_section">
                    <div class="map_control_section_header">Grid Overlay</div>

                    <div class="map_control_section_body">
                        <div class="button_text">Overlay a grid onto the map, this will show on both the GM and Player Screen. Saving the map will save the current grid settings.</div>
                        <div id="grid_toggle" class="button">Toggle Grid</div>

                        <div class="button_text">Change the grid size (pixels)</div>
                        <div id="grid_size_container"></div>

                        <div class="button_text">Shift the overlayed grid</div>
                        <div id="grid_shift">
                    </div>
                </div>

                <div class="map_control_section">
                    <div class="map_control_section_header">Spell/Shape Markers</div>

                    <div class="map_control_section_body">
                        <div class="button_text">Currently only useable with overlay grid enabled</div>
                        <div id="spell_marker_size" class="number_input_container"></div>

                        <div id="spell_marker_shape" class="radio_input"></div>
                        <div id="spell_marker_color" class="color_picker"></div>

                        <div class="button_text">Will cause a performance drop only while placing markers</div>
                        <div class="checkbox_container">
                            <div id="show_affected_tiles" class="checkbox"></div>
                            <div class="checkbox_label">Show grid cells affected by spells</div>
                        </div>
                    </div>
                </div>

                <div class="map_control_section">
                    <div class="map_control_section_header">Player Screen Controls</div>

                    <div class="map_control_section_body">
                        <div id="toggle_map_fit" class="button">Toggle Map Fit</div>

                        <div class="button_text">Scroll the Player Screen</div>
                        <div id="scroll_buttons"></div>

                        <div class="button_text">Zoom the Player Screen</div>
                        <div id="map_zoom"></div>

                        <div class="button_text">Dim the Player Screen (artificial screen brightness)</div>
                        <div id="player_screen_brightness"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

module.exports = ControlsManager;
