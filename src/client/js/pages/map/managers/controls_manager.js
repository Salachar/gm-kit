const NumberInput = require('../../../lib/inputs/numberInput');
const ArrowInput = require('../../../lib/inputs/arrowInput');
const Checkbox = require('../../../lib/inputs/checkbox');
const RadioInput = require('../../../lib/inputs/radio');
const ColorPicker = require('../../../lib/inputs/colorpicker');

const HelpManager = require('./help_manager');

class ControlsManager {
    constructor (opts = {}) {
        this.open = false;

        this.createInputs();

        Store.register({
            'deselect_spell_marker': this.deselectSpellMarker.bind(this),
        });
    }

    createInputs () {
        this.grid_size_input = new NumberInput('#grid_size_container', {
            step: 0.25,
            init: 50,
            store_key: 'size',
            store_event: 'grid_size_update_(ps)'
        });

        this.spell_marker_shape = new RadioInput('#spell_marker_shape', {
            options: ['line', 'square', 'circle', 'cone'],
            store_key: 'spell_marker_shape',
            store_event: 'spell_marker_shape_updated-(ps)'
        });

        this.map_zoom_input = new NumberInput('#map_zoom', {
            step: 0.025,
            interval: 20,
            store_key: 'zoom',
            store_event: 'zoom_(ps)'
        });

        this.player_screen_brightness_input = new NumberInput('#player_screen_brightness', {
            min: 0,
            max: 200,
            init: 100,
            interval: 30,
            store_key: 'brightness',
            store_event: 'brightness_(ps)'
        });
    }

    deselectSpellMarker () {
        this.spell_marker_shape.deselect();
    }

    update (map) {
        this.grid_size_input.set(map.managers.canvas.canvases.grid.attributes.size);
        this.map_zoom_input.set(map.player_screen_zoom);
        this.player_screen_brightness_input.set(map.managers.canvas.canvases.image.brightness);
    }

    render () {
        return ['div #map_controls_container', [
            ['div #map_controls_toggle .menu_icon', {
                click: (e) => {
                    this.open = !this.open;
                    if (this.open) {
                        Store.fire('show_map_controls');
                    } else {
                        Store.fire('hide_map_controls');
                    }
                }
            }, [
                ['div .menu_icon_bar .menu_icon_bar_1'],
                ['div .menu_icon_bar .menu_icon_bar_2'],
                ['div .menu_icon_bar .menu_icon_bar_3'],
            ]],

            ['div #map_controls_body', [
                ['div .map_control_section', [
                    ['div .map_control_section_header HTML=Common Hotkeys'],
                    ['div #common_hotkeys .map_control_section_body', [
                        ['div .button_text HTML=Common Hotkeys used during sessions'],
                        ...HelpManager.getHelpInfo().map((help_item) => {
                            if (!help_item.common) return;
                            return ['div .hotkey_section', [
                                [`span .hotkey_key HTML=${help_item.key}`],
                                [`span .hotkey_desc HTML=${help_item.text}`],
                            ]]
                        }).filter(e => e),
                    ]],
                ]],

                ['div .map_control_section', [
                    ['div .map_control_section_body', [
                        ['div #show_player_screen .button HTML=Show on Player Screen', {
                            click: (e) => Store.fire('show_player_screen')
                        }],
                    ]],
                ]],

                ['div .map_control_section', [
                    ['div .map_control_section_body', [
                        ['div #show_entire_map .button HTML=Show Entire Map', {
                            click: (e) => Store.fire('show_entire_map')
                        }],
                    ]],
                ]],

                ['div .map_control_section', [
                    ['div .map_control_section_header HTML=Grid Overlay'],
                    ['div .map_control_section_body', [
                        ['div .button_text HTML=Overlay a grid onto the map, this will show on both the GM and Player Screen. Saving the map will save the current grid settings'],
                        ['div #grid_toggle .button HTML=Toggle Grid', {
                            click: (e) => Store.fire('toggle_grid_(ps)')
                        }],

                        ['div .button_text HTML=Change the grid size (pixels'],
                        this.grid_size_input.render(),

                        ['div .button_text HTML=Shift the overlayed grid'],
                        new ArrowInput('#grid_shift', {
                            step: 1,
                            store_key: 'offset',
                            store_event: 'grid_offset_update_(ps)'
                        }).render(),
                    ]],
                ]],

                ['div .map_control_section', [
                    ['div .map_control_section_header HTML=Spell/Shape Markers'],
                    ['div .map_control_section_body', [
                        ['div .button_text HTML=Currently only useable with overlay grid enabled'],
                        new NumberInput('#spell_marker_size', {
                            step: 5,
                            init: 20,
                            store_key: 'spell_marker_size'
                        }).render(),

                        this.spell_marker_shape.render(),
                        new ColorPicker('#spell_marker_color', {
                            store_key: 'spell_marker_color'
                        }).render(),

                        ['div .button_text HTML=Will cause a performance drop only while placing markers'],
                        ['div .checkbox_container', [
                            new Checkbox('show_affected_tiles', {
                                store_key: 'show_affected_tiles show_affected_tiles_checked',
                                store_event: 'show_affected_tiles_toggled-(ps)'
                            }).render(),
                            ['div .checkbox_label HTML=Show grid cells affected by spells'],
                        ]],
                    ]],
                ]],

                ['div .map_control_section', [
                    ['div .map_control_section_header HTML=>Player Screen Controls'],
                    ['div .map_control_section_body', [
                        ['div #toggle_map_fit .button HTML=Toggle Map Fit', {
                            click: (e) => Store.fire('toggle_map_fit-(PS)')
                        }],

                        ['div .button_text HTML=Scroll the Player Screen'],
                        new ArrowInput('#scroll_buttons', {
                            step: 2,
                            interval: 10,
                            store_key: 'offset',
                            store_event: 'scroll_(PS)'
                        }).render(),

                        ['div .button_text HTML=Zoom the Player Screen'],
                        this.map_zoom_input.render(),

                        ['div .button_text HTML=Dim the Player Screen (artificial screen brightness)'],
                        this.player_screen_brightness_input.render(),
                    ]],
                ]],
            ]],
        ]];
    }
}

module.exports = ControlsManager;
