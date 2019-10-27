const CanvasManager = require('./canvas_manager');
const SegmentManager = require('./segment_manager');
const LightManager = require('./light_manager');
const TextManager = require('./text_manager');
const ObjectManager = require('./object_manager');

const {
    createElement,
    copyPoint,
    copy,
    resetSnap,
    getNormal,
    getAngleBetweenVectors
} = require('../../../lib/helpers');

class MapInstance {
    constructor (map = {}, options = {}) {
        this.map = map;
        this.map.json = this.map.json || {};
        this.map.json.meta = this.map.json.meta || {};

        // Link back to the main map manager if its needed
        this.manager = options.manager;
        // The path to the image for the map
        this.image = map.image || null;
        // Is this the currently active map or not
        this.active = false;
        // Zoom is now map specific
        this.zoom = 1;
        this.player_screen_zoom = (map.json.meta || {}).zoom || 1;
        // Whether light is enabled or not for this map
        this.lighting_enabled = CONFIG.is_player_screen;

        this.last_quickplace_coord = {
            x: null,
            y: null
        };

        this.one_way_wall = {
            segment: null,
            points: null
        };

        this.move_mode = null;

        this.el_tab = null;

        this.node = createElement('div', map.name + '_map map_container', {
            addTo: document.getElementById('map_containers')
        });

        this.SegmentManager = new SegmentManager(map, this, options);
        this.CanvasManager = new CanvasManager(map, this, options);
        this.LightManager = new LightManager(map, this, options);
        this.ObjectManager = new ObjectManager(this);
        this.TextManager = new TextManager(map, this, options);

        Store.register({
            'enable_light': this.onEnableLight.bind(this),
            'disable_light': this.onDisableLight.bind(this),
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

            'zoom_(ps)': this.playerScreenZoom.bind(this)
        }, this.name);
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

    onEnableLight () {
        this.enableLight();
    }

    onDisableLight () {
        this.disableLight();
    }

    onAddTextBlock () {
        this.TextManager.showTextInput();
    }

    onAddSegment (data) {
        this.SegmentManager.addSegment({
            segment: data.add_segment
        });
        CONFIG.snap.indicator.show = false;
        this.drawPlacementsUpdateLighting();
    }

    onSplitSegment (data) {
        this.SegmentManager.splitWall(data.split_data);
        CONFIG.snap.indicator.show = false;
        this.drawPlacementsUpdateLighting();
    }

    onLightChange () {
        this.CanvasManager.drawLight();
    }

    onDoorDrag (data) {
        this.SegmentManager.updateSelectedDoor(data.door_point);
        this.CanvasManager.drawPlacements();
        this.CanvasManager.drawLight({
            force_update: true
        });
    }

    onRemoveLight (data) {
        this.LightManager.removeLight(data.object);
        this.CanvasManager.drawLight();
    }

    onRemoveOneWay (data) {
        this.CanvasManager.drawWallLines();
        this.updateLighting();
    }

    onRemoveSegment (data) {
        this.SegmentManager.removeSegment(data.object.segment);
        this.CanvasManager.drawWallLines();
        this.updateLighting();
    }

    drawPlacementsUpdateLighting () {
        this.CanvasManager.drawWallLines();
        this.CanvasManager.drawPlacements();
        this.updateLighting();
    }

    onRemoveTextBlock (data) {
        this.TextManager.removeText(data.object.segment);
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
            name: this.name,
            json_directory: this.map.json_directory,
            image: this.image,
            lights_data: {
                enabled: this.lighting_enabled,
                lights: this.LightManager.lights,
                lights_added: this.LightManager.lights_added,
                polys: this.LightManager.light_polys
            },
            json: {
                segments: this.SegmentManager.sanitizedSegments(),
                text: this.TextManager.data,
                grid: this.CanvasManager.grid
            },
            meta: {
                zoom: this.player_screen_zoom,
                brightness: this.CanvasManager.brightness
            }
        };
    }

    get state () {
        const state_light_data = Object.keys(this.LightManager.lights).map((key) => {
            return {
                x: this.LightManager.lights[key].x,
                y: this.LightManager.lights[key].y
            };
        });

        return {
            lights: state_light_data,
            fog: this.CanvasManager.getFog()
        };
    }

    get full_data () {
        let data = this.data;
        data.json.state = this.state;
        return data;
    }

    loadState () {
        const state = ((this.map || {}).json || {}).state || {};
        if (state.fog) {
            Store.fire('load_fog', {
                fog: state.fog
            });
        }
        if (state.lights) {
            Store.fire('load_lights', {
                lights: state.lights
            });
        }
    }

    hide () {
        this.node.classList.add('hidden');
        if (this.tab) this.tab.classList.remove('selected');
    }

    show () {
        this.node.classList.remove('hidden');
        if (this.tab) this.tab.classList.add('selected');
        // this.CanvasManager.checkScroll();
    }

    shutdown () {
        this.node.remove();
        if (this.tab) {
            this.tab.remove();
        }
    }

    setZoom (new_zoom) {
        this.zoom = new_zoom;
        this.node.style.zoom = this.zoom;
    }

    onDelete (point) {
        if (CONFIG.move_mode) {
            this.SegmentManager.removePoint(Store.get('control_point'));
            return;
        }
        Store.fire('remove_closest', {
            point: point
        });
    }

    onKeyDown (key) {
        if (this.TextManager.open) return;
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
            [KEYS.DOWN]: 'arrow_down_press'
        }

        if (events[key]) {
            Store.fire(events[key], event_data);
        } else if (key === KEYS.DELETE) {
            this.onDelete(Mouse.point);
        } else if (key === KEYS.W) {
            this.CanvasManager.toggleWalls();
        }
    }

    onKeyUp (key) {
        // if (this.TextManager.open) return;
        const event_data = { point: Mouse.point };

        const events = {
            [KEYS.CONTROL]: 'move_point_ended',
            [KEYS.SHIFT]: 'quick_place_ended',
            [KEYS.LEFT]: 'arrow_left_release',
            [KEYS.RIGHT]: 'arrow_right_release',
            [KEYS.UP]: 'arrow_up_release',
            [KEYS.DOWN]: 'arrow_down_release'
        };

        if (events[key]) {
            Store.fire(events[key], event_data);
        }
    }

    checkForSnapPoint (exclude = {}) {
        const snap_point = this.SegmentManager.checkForWallEnds({
            show_indicator: true,
            exclude: exclude.point || null
        });
        if (!snap_point) {
            this.SegmentManager.checkForWallLines({
                show_indicator: true,
                exclude: exclude.point || null
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
        if (this.TextManager.open) {
            this.TextManager.close();
            return;
        }

        // Check to see if the user has clicked on a light
        let is_light_selected = this.LightManager.checkForLights();
        if (is_light_selected) return;

        // If lighting is enable on the GM side, check to see if a door was selected
        if (this.lighting_enabled) {
            return this.SegmentManager.checkForDoors();
        }

        if (CONFIG.move_mode) {
            Store.set({
                control_point: this.SegmentManager.getControlPoint()
            });
            this.SegmentManager.handleControlPoint(Store.get('control_point'));
            this.CanvasManager.drawPlacements();
            this.CanvasManager.drawWallLines();
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
        if (this.lighting_enabled) return;

        // Check for a snap point, if we are starting a wall close to an end or line
        // Make the new wall start with that end or point on the line, this makes it super easy
        // to create light-tight rooms
        this.checkForSnapPoint();

        // By default any new wall will start with where the mouse was clicked...
        this.SegmentManager.new_wall = copyPoint(Mouse);
        // ...unless there was something close enought to snap to (set in checkForSnapPoint)
        if (CONFIG.snap.indicator.point) {
            this.SegmentManager.new_wall = copyPoint(CONFIG.snap.indicator.point);
        }
    }

    mouseDownQuickPlace () {
        let new_segment = {
            p1: {
                x: this.last_quickplace_coord.x,
                y: this.last_quickplace_coord.y
            },
            p2: {
                x: null,
                y: null
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
                    segment: CONFIG.snap.indicator.segment
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
            control_point: null
        });

        if (this.LightManager.selected_light) {
            Store.fire('deselect_light');
        }

        if (this.SegmentManager.selected_door) {
            Store.fire('deselect_door');
        }

        if (Store.get('spell_marker_shape')) return;

        if (CONFIG.move_mode) return;

        if (Store.get('create_one_way_wall')) return;

        if (this.lighting_enabled || CONFIG.quick_place) return;

        if (!this.SegmentManager.new_wall) return;

        let new_wall = {
            p1: {
                x: this.SegmentManager.new_wall.x,
                y: this.SegmentManager.new_wall.y
            },
            p2: {
                x: Mouse.upX,
                y: Mouse.upY
            }
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
                        new_segment: new_wall
                    }
                });
            }
            // CONFIG.snap.indicator.point = null;
            resetSnap();
        }

        this.last_quickplace_coord = copyPoint(new_wall.p2);

        Store.fire('add_segment', {
            add_segment: new_wall
        });

        this.SegmentManager.new_wall = null;
    }

    mouseMove () {
        const spell_marker_shape = Store.get('spell_marker_shape');
        if (spell_marker_shape) {
            return Store.fire('draw_spell_marker-(ps)', {
                spell: {
                    shape: spell_marker_shape,
                    size: Store.get('spell_marker_size'),
                    origin: copyPoint(Mouse)
                }
            });
        }

        // Move point mode, CTRL is being held
        if (CONFIG.move_mode) {
            if (Mouse.down && Store.get('control_point')) {
                this.SegmentManager.handleControlPoint(Store.get('control_point'));
            } else {
                Store.set({
                    control_point: this.SegmentManager.getControlPoint()
                });
            }
            return this.drawPlacementsUpdateLighting();
        }

        // The user is dragging a light
        if (this.LightManager.selected_light) {
            Store.fire('light_move', {
                light: {
                    id: this.LightManager.selected_light.id,
                    x: Mouse.x,
                    y: Mouse.y
                }
            });
            return;
        }

        if (this.lighting_enabled && this.SegmentManager.selected_door) {
            return this.dragDoor();
        }

        // There is nothing more to check for if lighting is enabled
        if (this.lighting_enabled) return;

        // User is turning a wall into a one-way wall...
        if (Store.get('create_one_way_wall')) {
            let closest_wall = this.ObjectManager.findClosest('segment');
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
                point: this.SegmentManager.new_wall || this.last_quickplace_coord
            });
        }

        this.CanvasManager.drawPlacements();
    }

    dragDoor () {
        let selected_door = this.SegmentManager.selected_door;

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
        selected_door.length = selected_door.length || this.SegmentManager.segmentLength(selected_door);

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

    enableLight () {
        this.lighting_enabled = true;
        this.SegmentManager.prepareSegments();
        this.CanvasManager.enableLight();
    }

    disableLight () {
        if (CONFIG.is_player_screen) return;
        this.lighting_enabled = false;
        this.CanvasManager.disableLight();
    }

    updateLighting () {
        this.SegmentManager.prepareSegments();
        if (this.lighting_enabled || window.player_screen) {
            this.CanvasManager.drawLight({
                force_update: true
            });
        }
    }
}
module.exports = MapInstance;
