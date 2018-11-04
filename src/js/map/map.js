const CanvasManager = require('./canvas_manager');
const SegmentManager = require('./segment_manager');
const LightManager = require('./light_manager');
const ObjectManager = require('./object_manager');

const Store = require('../store');

const Helpers = require('../helpers');
const copyPoint = Helpers.copyPoint;
const getNormal = Helpers.getNormal;

class MapInstance {
    constructor (map = {}) {
        this.map = map;

        this.image = map.image || null;
        // Is this the currently active map or not
        this.active = false;
        // Zoom is now map specific
        this.zoom = 1;
        // Whether light is enabled or not for this map
        this.lighting_enabled = CONFIG.is_display;

        this.SegmentManager = new SegmentManager(map, this);
        this.CanvasManager = new CanvasManager(map, this);
        this.LightManager = new LightManager(map, this);
        this.ObjectManager = new ObjectManager(this);

        this.last_quickplace_coord = {
            x: null,
            y: null
        };

        this.one_way_wall = {
            segment: null,
            points: null
        };

        this.move_segment = null;

        // Stuff
        this.node = this.CanvasManager.canvas_container;

        this.el_tab = null;

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
        }, this.name);
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

    onAddSegment (data) {
        this.SegmentManager.addSegment({
            segment: data.add_segment
        });
        CONFIG.snap.indicator.show = false;
        this.CanvasManager.drawWallLines();
        this.CanvasManager.drawPlacements();
        this.updateLighting();
    }

    onSplitSegment (data) {
        this.SegmentManager.splitWall(data.split_data);
        CONFIG.snap.indicator.show = false;
        this.CanvasManager.drawWallLines();
        this.CanvasManager.drawPlacements();
        this.updateLighting();
    }

    onLightChange () {
        this.CanvasManager.drawLights();
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
        this.CanvasManager.drawLights();
        this.CanvasManager.drawLight();
    }

    onRemoveSegment (data) {
        this.SegmentManager.removeSegment(data.object.segment);
        this.CanvasManager.drawWallLines();
        this.updateLighting();
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
        this.SegmentManager.sanitize();
        return {
            name: this.name,
            json_directory: this.map.json_directory,
            image: this.image,
            lights_data: {
                lights: this.LightManager.lights,
                lights_added: this.LightManager.lights_added,
                polys: this.LightManager.light_polys
            },
            json: {
                segments: this.SegmentManager.segments
            }
        };
    }

    hide () {
        this.node.classList.add('hidden');
        if (this.tab) this.tab.classList.remove('selected');
    }

    show () {
        this.node.classList.remove('hidden');
        if (this.tab) this.tab.classList.add('selected');
        this.CanvasManager.checkScroll();
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
        if (CONFIG.move_segment) {
            this.SegmentManager.removePoint(Store.get('control_point'));
            return;
        }
        Store.fire('remove_closest', {
            point: point
        });
    }

    onKeyDown (key) {
        const point = {
            x: Mouse.x,
            y: Mouse.y
        };

        switch (key) {
            case KEYS.MINUS:
                Store.fire('zoom_out');
                break;
            case KEYS.PLUS:
                Store.fire('zoom_in');
                break;
            case KEYS.DELETE:
                this.onDelete(point);
                break;
            case KEYS.SHIFT:
                Store.fire('quick_place_started');
                break;
            case KEYS.A:
                Store.fire('add_light', {
                    point: point
                });
                break;
            case KEYS.D:
                Store.fire('disable_light');
                break;
            case KEYS.E:
                Store.fire('enable_light');
                break;
            case KEYS.O:
                Store.fire('toggle_closest_door', {
                    point: point
                });
                break;
            case KEYS.T:
                Store.fire('switch_wall_door', {
                    point: point
                });
                break;
            case KEYS.W:
                // Doesn't apply to display canvas (yet)
                this.CanvasManager.toggleWalls();
                break;
            case KEYS.LEFT:
                Store.fire('scroll_left');
                break;
            case KEYS.RIGHT:
                Store.fire('scroll_right');
                break;
            case KEYS.UP:
                Store.fire('scroll_up');
                break;
            case KEYS.DOWN:
                Store.fire('scroll_down');
                break;
            default:
                break;
        }
    }

    onKeyUp (key) {
        switch (key) {
            case KEYS.CONTROL:
                Store.fire('move_point_ended');
                break;
            case KEYS.SHIFT:
                Store.fire('quick_place_ended');
                break;
            default:
                break;
        }
    }

    checkForSnapPoint () {
        const snap_point = this.SegmentManager.checkForWallLines({
            show_indicator: true
        });
        if (!snap_point) {
            this.SegmentManager.checkForWallEnds({
                show_indicator: true
            });
        }
    }

    mouseDown () {
        if (!Mouse.left) return;

        let is_light_selected = this.LightManager.checkForLights();
        if (is_light_selected) return;

        if (this.lighting_enabled) {
            return this.SegmentManager.checkForDoors();
        }

        if (CONFIG.move_segment) {
            Store.set({
                control_point: this.SegmentManager.getControlPoint()
            });
            this.SegmentManager.handleControlPoint(Store.get('control_point'));
            this.CanvasManager.drawPlacements();
            this.CanvasManager.drawWallLines();
            return;
        }

        if (CONFIG.create_one_way_wall) {
            if (this.one_way_wall.points && this.one_way_wall.segment) {
                this.one_way_wall.segment.one_way = this.one_way_wall.points;
            }
            return;
        }

        if (CONFIG.quick_place) {
            return this.mouseDownQuickPlace();
        }

        if (this.lighting_enabled) return;

        this.checkForSnapPoint();

        this.SegmentManager.new_wall = copyPoint(Mouse);
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

        if (CONFIG.move_segment) return;

        if (CONFIG.create_one_way_wall) return;

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
                        segment: CONFIG.snap.indicator.segment
                    }
                });
            }
            CONFIG.snap.indicator.point = null;
        }

        this.last_quickplace_coord = copyPoint(new_wall.p2);

        Store.fire('add_segment', {
            add_segment: new_wall
        });

        this.SegmentManager.new_wall = null;
    }

    mouseMove () {
        if (CONFIG.move_segment) {
            if (Mouse.down && Store.get('control_point')) {
                this.SegmentManager.handleControlPoint(Store.get('control_point'));
            } else {
                Store.set({
                    control_point: this.SegmentManager.getControlPoint()
                });
            }
            this.CanvasManager.drawPlacements();
            this.CanvasManager.drawWallLines();
            return;
        }

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

        if (this.lighting_enabled) return;

        if (CONFIG.create_one_way_wall) {
            let closest_wall = this.ObjectManager.findClosest('wall')
            let one_way_info = getNormal(closest_wall);
            if (one_way_info) {
                this.one_way_wall.segment = closest_wall.segment;
                this.one_way_wall.points = one_way_info;
            } else {
                this.one_way_wall.segment = null;
                this.one_way_wall.points = null;
            }

            this.CanvasManager.drawPlacements();
            this.CanvasManager.drawWallLines();
            return;
        }

        if (Mouse.down || CONFIG.quick_place) {
            this.checkForSnapPoint();
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
        if (CONFIG.is_display) return;
        this.lighting_enabled = false;
        this.CanvasManager.disableLight();
    }

    updateLighting () {
        this.SegmentManager.prepareSegments();
        if (this.lighting_enabled || window.display_window) {
            this.CanvasManager.drawLight({
                force_update: true
            });
        }
    }
}
module.exports = MapInstance;
