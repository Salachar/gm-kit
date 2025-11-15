const Button = require('../../../lib/inputs/button');
const NumberInput = require('../../../lib/inputs/numberInput');
const ArrowInput = require('../../../lib/inputs/arrowInput');
const Checkbox = require('../../../lib/inputs/checkbox');

const Note = require('../../../lib/components/note');

// const RadioInput = require('../../../lib/inputs/radio');
// const ColorPicker = require('../../../lib/inputs/colorpicker');

class ControlsManager {
  constructor (opts = {}) {
    // Store.register({
    //   'deselect_spell_marker': this.deselectSpellMarker.bind(this),
    // });

    this.map = null;
  }

  // deselectSpellMarker () {
  //   this.refs.spell_marker_shape.deselect();
  // }

  update (map) {
    this.map = map;
    // Checkboxes
    this.refs.enable_grid.checked = map.managers.canvas.canvases.grid.attributes.show;
    // Number inputs
    if (map.managers.canvas.canvases.image.video) {
      this.refs.animated_map_volume.value = map.managers.canvas.canvases.image.video.volume;
    }
    this.refs.sight_limit.value = map.managers.light.bright_limit;
    this.refs.grid_size_input.value = map.managers.canvas.canvases.grid.attributes.size;
    this.refs.map_zoom_input.value = map.player_screen_zoom;
    this.refs.player_screen_brightness.value = map.managers.canvas.canvases.image.brightness;
  }

  render () {
    return ['div #map_controls_container', [
      ['div #map_controls_body', [
        new Button('.map_controls_button .mb_2', {
          text: 'Show on Player Screen',
          store_event: 'show_player_screen',
          size: "large",
        }),
        new Note('.mb_1', {
          text: "Player Screen only controls",
        }),
        new Button('.map_controls_button .mb_1', {
          parent: this,
          text: 'Show Entire Map',
          store_key: 'show_entire_map_enabled',
          store_event: 'show_entire_map'
        }),
        new Button('.map_controls_button .mb_1', {
          parent: this,
          text: 'Fit Map To Screen',
          store_key: 'fit_map_to_screen_enabled',
          store_event: 'fit_map_to_screen-(PS)'
        }),
        new Button('.map_controls_button .mb_1', {
          parent: this,
          text: 'Flip Map Vertically',
          store_event: 'flip_map_vertically-(PS)'
        }),
        new Checkbox('#disable_sight_limit .hr_pad .mb_1', {
          parent: this,
          text: 'Disable Sight Limit',
          store_key: 'disable_sight_limit',
          store_event: 'disable_sight_limit',
        }),
        new NumberInput('#sight_limit .mb_1', {
          text: 'Sight Limit',
          step: 5,
          default_value: 200,
          interval: 100,
          store_key: 'sight_limit',
          store_event: 'sight_limit',
          parent: this,
        }),
        new NumberInput('#map_zoom_input .mb_1', {
          text: 'Zoom',
          step: 0.025,
          interval: 20,
          store_key: 'zoom',
          store_event: 'zoom_(ps)',
          parent: this,
        }),
        new NumberInput('#player_screen_brightness .mb_2', {
          text: 'Brightness',
          min: 0,
          max: 200,
          default_value: 100,
          interval: 30,
          store_key: 'brightness',
          store_event: 'brightness_(ps)',
          parent: this,
        }),
        new Note('.mb_1', {
          text: "Grid size and position can be saved",
        }),
        new Checkbox('#enable_grid .hr_pad', {
          parent: this,
          text: 'Enable Grid',
          store_key: 'overlay_grid_enabled',
          store_event: 'overlay_grid_toggled_(ps)'
        }),
        new Checkbox('#enable_bright_grid .hr_pad .mb_1', {
          parent: this,
          text: 'Bright Grid (DM Only)',
          store_key: 'bright_grid_enabled',
          store_event: 'bright_grid_toggled'
        }),
        new NumberInput('#grid_size_input .mb_1', {
          text: 'Size',
          step: 0.25,
          default_value: 50,
          store_key: 'size',
          store_event: 'grid_size_update_(ps)',
          parent: this,
        }),
        new ArrowInput('.mb_1', {
          text: 'Position',
          step: 1,
          store_key: 'offset',
          store_event: 'grid_offset_update_(ps)'
        }),
        new NumberInput('#animated_map_volume .mb_1', {
          text: 'Animated Map Volume',
          min: 0,
          max: 1,
          step: 0.02,
          default_value: 0,
          store_key: 'animated_map_volume',
          store_event: 'animated_map_volume_change',
          parent: this,
        }),
        // new NumberInput({
        //   text: '* Requires Grid',
        //   step: 5,
        //   init: 20,
        //   store_key: 'spell_marker_size'
        // }),
        // new RadioInput('#spell_marker_shape', {
        //   options: ['line', 'square', 'circle', 'cone'],
        //   store_key: 'spell_marker_shape',
        //   store_event: 'spell_marker_shape_updated-(ps)',
        //   parent: this,
        // }),
        // new ColorPicker('#spell_marker_color .hr_mb', {
        //   store_key: 'spell_marker_color'
        // }),
        // new Checkbox('.hr_pad', {
        //   text: 'Highlight Affected Tiles',
        //   store_key: 'show_affected_tiles show_affected_tiles_checked',
        //   store_event: 'show_affected_tiles_toggled-(ps)'
        // }),
      ]],
    ]];
  }
}

module.exports = ControlsManager;
