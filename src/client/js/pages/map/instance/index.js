const {
  copyPoint,
  copy,
  resetSnap,
  getNormal,
  getWindowDimensions,
} = Lib.helpers;

const CanvasManager = require('./managers/canvas');
const SegmentManager = require('./managers/segment');
const LightManager = require('./managers/light');
const TextManager = require('./managers/text');
const ObjectManager = require('./managers/object');

class MapInstance {
  constructor (map = {}, options = {}) {
    this.map = map;

    this.map.json = this.map.json || {};
    this.map.json.meta = this.map.json.meta || {};

    // Link back to the main map manager if its needed
    // TextManager uses this at the moment
    this.manager = options.manager;

    // The path to the image for the map
    // this.image = map.image || null;
    // TODO: stupid video shit
    // this.media = map.image || map.video || null;

    // Is this the currently active map or not
    this.active = false;
    // Zoom is now map specific
    this.map_fit = false;
    this.pre_fit_zoom = 1;
    this.pre_fit_scroll_top;
    this.pre_fit_scroll_left;

    this.zoom = 1;
    this.player_screen_zoom = (map.json.meta || {}).zoom || 1;
    // Whether light is enabled or not for this map
    Store.set({
      lighting_enabled: CONFIG.is_player_screen
    });

    this.last_quickplace_coord = {
      x: null,
      y: null,
    };

    this.one_way_wall = {
      segment: null,
      points: null,
    };

    this.move_mode = null;

    this.el_tab = null;

    const parent_node = document.getElementById('map_containers');
    this.node = Lib.dom.generate([`div .${map.name}_map .map_container`], null, parent_node);

    const opts = {
      map_data: map,
      map_instance: this,
    };
    this.managers = {
      segment: new SegmentManager(opts),
      canvas: new CanvasManager(opts),
      light: new LightManager(opts),
      object: new ObjectManager(opts),
      text: new TextManager(opts),
    };

    Store.register({
      // 'enable_light': this.onEnableLight.bind(this),
      // 'disable_light': this.onDisableLight.bind(this),

      'add_segment': this.onAddSegment.bind(this),
      'split_segment': this.onSplitSegment.bind(this),
      'light_moved': this.onLightChange.bind(this),
      'light_added': this.onLightChange.bind(this),
      'door_drag': this.onDoorDrag.bind(this),
      'zoom_in': this.onZoomIn.bind(this),
      'zoom_out': this.onZoomOut.bind(this),
      'remove_light': this.onRemoveLight.bind(this),
      'remove_segment': this.onRemoveSegment.bind(this),
      'remove_text_block': this.onRemoveTextBlock.bind(this),
      'remove_one_way': this.onRemoveOneWay.bind(this),
      'add_text_block': this.onAddTextBlock.bind(this),
      'zoom_(ps)': this.playerScreenZoom.bind(this),
      'fit_map_to_screen': this.fitMapToScreen.bind(this),
    }, this.name);
  }

  fitMapToScreen (data) {
    getWindowDimensions();

    let window_ratio = (CONFIG.window_width / CONFIG.window_height) || 1;
    this.map_fit = !this.map_fit;
    // this.map_fit = data.fit_map_to_screen_enabled;

    if (!this.map_fit) {
      this.setZoom(this.pre_fit_zoom || 1);
      this.node.scrollLeft = this.pre_fit_scroll_left;
      this.node.scrollTop = this.pre_fit_scroll_top;
      return;
    }

    this.pre_fit_zoom = this.zoom;
    this.pre_fit_scroll_left = this.node.scrollLeft;
    this.pre_fit_scroll_top = this.node.scrollTop;

    if (this.managers.canvas.canvases.image.ratio > window_ratio) {
      // The image is wider and needs to be bound by width
      this.setZoom(CONFIG.window_width / this.managers.canvas.canvases.image.width);
    } else {
      // The image is taller and needs to be bound by height
      this.setZoom(CONFIG.window_height / this.managers.canvas.canvases.image.height);
    }
  }

  playerScreenZoom (data) {
    if (data && data.zoom) {
      this.player_screen_zoom = data.zoom;
    }
    if (CONFIG.is_player_screen) {
      this.setZoom(this.player_screen_zoom);
    }
  }

  onZoomIn () {
    this.setZoom(this.zoom + 0.025);
  }

  onZoomOut () {
    this.setZoom(this.zoom - 0.025);
  }

  setZoom (new_zoom) {
    this.zoom = new_zoom;
    this.node.style.zoom = this.zoom;
  }

  onAddTextBlock () {
    this.managers.text.showTextInput();
  }

  onAddSegment (data) {
    this.managers.segment.addSegment({
      segment: data.add_segment,
    });
    CONFIG.snap.indicator.show = false;
    this.drawPlacementsUpdateLighting();
  }

  onSplitSegment (data) {
    this.managers.segment.splitWall(data.split_data);
    CONFIG.snap.indicator.show = false;
    this.drawPlacementsUpdateLighting();
  }

  onLightChange () {
    this.managers.canvas.drawLight();
  }

  onDoorDrag (data) {
    this.managers.segment.updateSelectedDoor(data.door_point);
    Store.fire('draw_placements');
    this.managers.canvas.drawLight({
      force_update: true,
    });
  }

  onRemoveLight (data) {
    this.managers.light.removeLight(data.object);
    this.managers.canvas.drawLight();
  }

  onRemoveOneWay (data) {
    Store.fire('draw_walls');
    this.updateLighting();
  }

  onRemoveSegment (data) {
    this.managers.segment.removeSegment(data.object.segment);
    Store.fire('draw_walls');
    this.updateLighting();
  }

  drawPlacementsUpdateLighting () {
    Store.fire('draw_walls');
    Store.fire('draw_placements');
    this.updateLighting();
  }

  onRemoveTextBlock (data) {
    this.managers.text.removeText(data.object.segment);
  }

  set tab (tab) {
    this.el_tab = tab;
  }

  get tab () {
    return this.el_tab;
  }

  get name () {
    return this.map.name || '';
  }

  get data () {
    return {
      ...this.map,
      lights_data: {
        enabled: Store.get('lighting_enabled'),
        lights: this.managers.light.lights,
        lights_added: this.managers.light.lights_added,
        polys: this.managers.light.light_polys,
      },
      json: {
        segments: this.managers.segment.sanitizedSegments(),
        text: this.managers.text.data,
        grid: this.managers.canvas.canvases.grid.attributes,
      },
      meta: {
        zoom: this.player_screen_zoom,
        brightness: this.managers.canvas.brightness,
      }
    };
  }

  get full_data () {
    let data = this.data;
    return data;
  }

  hide () {
    this.node.classList.add('hidden');
    if (this.tab) this.tab.classList.remove('selected');
  }

  show () {
    this.node.classList.remove('hidden');
    if (this.tab) this.tab.classList.add('selected');
  }

  shutdown () {
    this.node.remove();
    if (this.tab) {
      this.tab.remove();
    }
  }

  onDelete (point) {
    if (CONFIG.move_mode) {
      this.managers.segment.removePoint(Store.get('control_point'));
      return;
    }
    Store.fire('remove_closest', {
      point: point
    });
  }

  onKeyDown (key) {
    if (this.managers.text.open) return;
    const event_data = { point: Mouse.point };

    const events = {
      [KEYS.QUESTION]: 'add_text_block',
      [KEYS.MINUS]: 'zoom_out',
      [KEYS.PLUS]: 'zoom_in',
      [KEYS.SHIFT]: 'quick_place_started',
      [KEYS.A]: 'add_light',
      [KEYS.D]: 'disable_light',
      [KEYS.E]: 'enable_light',
      [KEYS.O]: 'toggle_closest_door',
      [KEYS.T]: 'switch_wall_door',
      [KEYS.LEFT]: 'arrow_left_press',
      [KEYS.RIGHT]: 'arrow_right_press',
      [KEYS.UP]: 'arrow_up_press',
      [KEYS.DOWN]: 'arrow_down_press',
    }

    if (events[key]) {
      Store.fire(events[key], event_data);
    } else if (key === KEYS.DELETE) {
      this.onDelete(Mouse.point);
    }
  }

  onKeyUp (key) {
    // if (this.managers.text.open) return;
    const event_data = { point: Mouse.point };

    const events = {
      [KEYS.CONTROL]: 'move_point_ended',
      [KEYS.SHIFT]: 'quick_place_ended',
      [KEYS.LEFT]: 'arrow_left_release',
      [KEYS.RIGHT]: 'arrow_right_release',
      [KEYS.UP]: 'arrow_up_release',
      [KEYS.DOWN]: 'arrow_down_release',
    };

    if (events[key]) {
      Store.fire(events[key], event_data);
    }
  }

  checkForSnapPoint (exclude = {}) {
    const snap_point = this.managers.segment.checkForWallEnds({
      show_indicator: true,
      exclude: exclude.point || null,
    });
    if (!snap_point) {
      this.managers.segment.checkForWallLines({
        show_indicator: true,
        exclude: exclude.point || null,
      });
    }
  }

  mouseDown () {
    // We aren't doing anything with context menus at the moment, so ignore all but left nouse
    if (!Mouse.left) return;

    if (Store.get('spell_marker_shape')) {
      Store.fire('place_spell_marker-(ps)');
      return;
    }

    // The user clicked on the map while the text input was open
    if (this.managers.text.open) {
      this.managers.text.close();
      return;
    }

    // Check to see if the user has clicked on a light
    let is_light_selected = this.managers.light.checkForLights();
    if (is_light_selected) return;

    // If lighting is enable on the GM side, check to see if a door was selected
    if (Store.get('lighting_enabled')) {
      return this.managers.segment.checkForDoors();
    }

    if (CONFIG.move_mode) {
      Store.set({
        control_point: this.managers.segment.getControlPoint()
      });
      this.managers.segment.handleControlPoint(Store.get('control_point'));

      Store.fire('draw_placements');
      Store.fire('draw_walls');
      return;
    }

    if (Store.get('create_one_way_wall')) {
      if (this.one_way_wall.points && this.one_way_wall.segment) {
        this.one_way_wall.segment.one_way = this.one_way_wall.points;
      }
      return;
    }

    if (CONFIG.quick_place) {
      return this.mouseDownQuickPlace();
    }

    // There is nothing else to check for if lighting is enabled
    if (Store.get('lighting_enabled')) return;

    // Check for a snap point, if we are starting a wall close to an end or line
    // Make the new wall start with that end or point on the line, this makes it super easy
    // to create light-tight rooms
    this.checkForSnapPoint();

    // By default any new wall will start with where the mouse was clicked...
    this.managers.segment.new_wall = copyPoint(Mouse);
    // ...unless there was something close enought to snap to (set in checkForSnapPoint)
    if (CONFIG.snap.indicator.point) {
      this.managers.segment.new_wall = copyPoint(CONFIG.snap.indicator.point);
    }
  }

  mouseDownQuickPlace () {
    let new_segment = {
      p1: {
        x: this.last_quickplace_coord.x,
        y: this.last_quickplace_coord.y,
      },
      p2: {
        x: null,
        y: null,
      }
    };

    if (CONFIG.snap.indicator.point) {
      new_segment.p2 = copyPoint(CONFIG.snap.indicator.point);
    } else {
      new_segment.p2.x = Math.round(Mouse.downX);
      new_segment.p2.y = Math.round(Mouse.downY);
    }

    if (CONFIG.snap.indicator.segment) {
      Store.fire('split_segment', {
        split_data: {
          point: CONFIG.snap.indicator.point,
          segment: CONFIG.snap.indicator.segment,
        }
      });
    }

    this.last_quickplace_coord = copyPoint(new_segment.p2);

    Store.fire('add_segment', {
      add_segment: new_segment
    });
  }

  mouseUp () {
    if (!Mouse.left) return;

    Store.set({
      control_point: null,
    });

    if (this.managers.light.selected_light) {
      Store.fire('deselect_light');
    }

    if (this.managers.segment.selected_door) {
      Store.fire('deselect_door');
    }

    if (Store.get('spell_marker_shape')) return;

    if (CONFIG.move_mode) return;

    if (Store.get('create_one_way_wall')) return;

    if (Store.get('lighting_enabled') || CONFIG.quick_place) return;

    if (!this.managers.segment.new_wall) return;

    let new_wall = {
      p1: {
        x: this.managers.segment.new_wall.x,
        y: this.managers.segment.new_wall.y,
      },
      p2: {
        x: Mouse.upX,
        y: Mouse.upY,
      },
    };

    // If the snap indicator is showing, then we dont want to put the point on the mouse
    // but where the indicator is showing instead.
    if (CONFIG.snap.indicator.show) {
      new_wall.p2 = copyPoint(CONFIG.snap.indicator.point);
      if (CONFIG.snap.indicator.segment) {
        Store.fire('split_segment', {
          split_data: {
            point: copyPoint(CONFIG.snap.indicator.point),
            segment: copy(CONFIG.snap.indicator.segment),
            new_segment: new_wall,
          },
        });
      }
      // CONFIG.snap.indicator.point = null;
      resetSnap();
    }

    this.last_quickplace_coord = copyPoint(new_wall.p2);

    Store.fire('add_segment', {
      add_segment: new_wall,
    });

    this.managers.segment.new_wall = null;
  }

  mouseMove () {
    if (Store.get('spell_marker_shape')) {
      return Store.fire('draw_spell_marker-(ps)', {
        spell: {
          origin: copyPoint(Mouse)
        }
      });
    }

    // Move point mode, CTRL is being held
    if (CONFIG.move_mode) {
      if (Mouse.down && Store.get('control_point')) {
        this.managers.segment.handleControlPoint(Store.get('control_point'));
      } else {
        Store.set({
          control_point: this.managers.segment.getControlPoint()
        });
      }
      return this.drawPlacementsUpdateLighting();
    }

    // The user is dragging a light
    if (this.managers.light.selected_light) {
      Store.fire('light_move', {
        light: {
          id: this.managers.light.selected_light.id,
          x: Mouse.x,
          y: Mouse.y,
        }
      });
      return;
    }

    if (Store.get('lighting_enabled') && this.managers.segment.selected_door) {
      return this.dragDoor();
    }

    // There is nothing more to check for if lighting is enabled
    if (Store.get('lighting_enabled')) return;

    // User is turning a wall into a one-way wall...
    if (Store.get('create_one_way_wall')) {
      let closest_wall = this.managers.object.findClosest('segment');
      let one_way_info = getNormal(closest_wall);
      if (one_way_info) {
        this.one_way_wall.segment = closest_wall.segment;
        this.one_way_wall.points = one_way_info;
      } else {
        this.one_way_wall.segment = null;
        this.one_way_wall.points = null;
      }
      return this.drawPlacementsUpdateLighting();
    }

    // General wall placing, check for points to snap to, and
    // make sure to exclude the starting point
    if (Mouse.down || CONFIG.quick_place) {
      this.checkForSnapPoint({
        point: this.managers.segment.new_wall || this.last_quickplace_coord
      });
    }

    Store.fire('draw_placements');
  }

  dragDoor () {
    let selected_door = this.managers.segment.selected_door;

    if (!selected_door.p1_grab && !selected_door.p2_grab) return;

    // Determine what point was grabbed and what point is stationary
    let point_to_move = null;
    let still_point = null;
    if (selected_door.p1_grab) {
      point_to_move = (selected_door.temp_p1) ? 'temp_p1' : 'p1';
      still_point = (selected_door.temp_p2) ? 'temp_p2' : 'p2';
    }
    if (selected_door.p2_grab) {
      point_to_move = (selected_door.temp_p2) ? 'temp_p2' : 'p2';
      still_point = (selected_door.temp_p1) ? 'temp_p1' : 'p1';
    }

    // Get the vector from the mouse to the part of
    // the door not moving (the hinge). The door will be
    // along this line
    const v1 = Mouse.x - selected_door[still_point].x;
    const v2 = Mouse.y - selected_door[still_point].y;

    // Get the unit fot that vector
    const v_mag = Math.sqrt((v1 * v1) + (v2 * v2));
    const u1 = v1 / v_mag;
    const u2 = v2 / v_mag;

    // If there is no length for the door, we need to get it.
    // There will never be a length the first time a door is dragged
    selected_door.length = selected_door.length || this.managers.segment.segmentLength(selected_door);

    // Unit vector * door length = new vector for door
    const d_u1 = u1 * selected_door.length;
    const d_u2 = u2 * selected_door.length;

    // Get the new temporary ending point for the door
    const new_p1 = selected_door[still_point].x + d_u1;
    const new_p2 = selected_door[still_point].y + d_u2;

    // No "temp" means this is the first time the door is being moved
    // otherwise its an update to an already opened door
    let point_info = {};
    if (!point_to_move.match(/temp/)) {
      point_info[`temp_${point_to_move}`] = {};
      point_info[`temp_${point_to_move}`].x = new_p1;
      point_info[`temp_${point_to_move}`].y = new_p2;
    } else {
      point_info[point_to_move] = {};
      point_info[point_to_move].x = new_p1;
      point_info[point_to_move].y = new_p2;
    }

    return Store.fire('door_drag', {
      door_point: point_info
    });
  }

  updateLighting () {
    Store.fire('prepare_segments');
    if (Store.get('lighting_enabled') || window.player_screen) {
      this.managers.canvas.drawLight({
        force_update: true
      });
    }
  }
}

module.exports = MapInstance;
