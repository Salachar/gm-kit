const CanvasManager = require('./canvas_manager');
const SegmentManager = require('./segment_manager');
const LightManager = require('./light_manager');
const ObjectManager = require('./object_manager');

const getNormal = require('../helpers').getNormal;

class MapInstance {
    constructor (map = {}) {
        this.map = map;

        this.image = map.image || null;
        // Is this the currently active map or not
        this.active = false;
        // Zoom is now map specific
        this.zoom = 1;
        // Whether light is enabled or not for this map
        this.lighting_enabled = DISPLAY_WINDOW;

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

        // Stuff
        this.node = this.CanvasManager.canvas_container;

        this.el_tab = null;
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
        // this.SegmentManager.closeAllDoors();
        // Lights are important, but not saved.
        // Only info to save goes in the json sectio

        this.SegmentManager.sanitize();

        return {
            name: this.name,
            json_directory: this.map.json_directory,
            // directory: this.map.directory,
            image: this.image,
            lights_data: {
                lights: this.LightManager.lights,
                lights_added: this.LightManager.lights_added,
            },
            json: {
                walls: this.SegmentManager.walls,
                doors: this.SegmentManager.doors,
            }
        };
    }

    hide () {
        this.node.classList.add('hidden');
        if (this.tab) {
            this.tab.classList.remove('selected');
        }
    }

    show () {
        this.node.classList.remove('hidden');
        if (this.tab) {
            this.tab.classList.add('selected');
        }
    }

    shutdown () {
        this.node.remove();
        if (this.tab) {
            this.tab.remove();
        }
    }

    setZoom (new_zoom) {
        if (KEY_DOWN[KEYS.ALT] && !DISPLAY_WINDOW) return;
        this.zoom = new_zoom;
        this.node.style.zoom = this.zoom;
    }

    onKeyDown (key) {
        const point = {
            x: Mouse.x,
            y: Mouse.y
        };
        switch (key) {
            case KEYS.MINUS:
                // this.setZoom(this.zoom - 0.025);
                fireEvent('zoom_out');
                break;
            case KEYS.PLUS:
                // this.setZoom(this.zoom + 0.025);
                fireEvent('zoom_in');
                break;
            case KEYS.SHIFT:
                fireEvent('quick_place_started');
                break;
            case KEYS.A:
                fireEvent('add_light', point);
                break;
            case KEYS.D:
                fireEvent('disable_light');
                break;
            case KEYS.E:
                fireEvent('enable_light');
                break;
            case KEYS.O:
                fireEvent('toggle_closest_door', point);
                break;
            case KEYS.R:
                fireEvent('remove_closest', point);
                break;
            case KEYS.T:
                fireEvent('switch_wall_door', point);
                break;
            case KEYS.W:
                // Doesn't apply to display canvas (yet)
                this.CanvasManager.toggleWalls();
                break;
            case KEYS.LEFT:
                fireEvent('scroll_left');
                break;
            case KEYS.RIGHT:
                fireEvent('scroll_right');
                break;
            case KEYS.UP:
                fireEvent('scroll_up');
                break;
            case KEYS.DOWN:
                fireEvent('scroll_down');
                break;
            default:
                break;
        }
    }

    onKeyUp (key) {
        switch (key) {
            case KEYS.SHIFT:
                 fireEvent('quick_place_ended');
                break;
            default:
                break;
        }
    }

    mouseDown () {
        if (!Mouse.left) return;

        let is_light_selected = this.LightManager.checkForLights();
        if (is_light_selected) return;

        if (this.lighting_enabled) {
            return this.SegmentManager.checkForDoors();
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

        if (CONFIG.snap.end || CONFIG.snap.line) {
            let wall_function = (CONFIG.snap.end) ? 'checkForWallEnds' : 'checkForWallLines';
            let point = this.SegmentManager[wall_function]({
                show_indicator: false
            });

            if (point) {
                this.SegmentManager.new_wall.start.x = point.x;
                this.SegmentManager.new_wall.start.y = point.y;
                return;
            }
        }

        if (this.lighting_enabled) return;

        this.SegmentManager.new_wall.start.x = Mouse.downX;
        this.SegmentManager.new_wall.start.y = Mouse.downY;
    }

    mouseDownQuickPlace () {
        let new_segment = {
            p1x: this.last_quickplace_coord.x,
            p1y: this.last_quickplace_coord.y,
            p2x: Math.round(Mouse.downX),
            p2y: Math.round(Mouse.downY)
        }

        // this.last_quickplace_coord.x = Mouse.downX;
        // this.last_quickplace_coord.y = Mouse.downY;
        this.last_quickplace_coord.x = new_segment.p2x;
        this.last_quickplace_coord.y = new_segment.p2y;

        return fireEvent('add_segment', {
            segment: new_segment,
            door: CONFIG.create_door
        });
    }

    mouseUp () {
        if (!Mouse.left) return;

        if (CONFIG.create_one_way_wall) {
            return;
        }

        if (this.LightManager.selected_light) {
            return fireEvent('deselect_light');
        }

        if (this.SegmentManager.selected_door) {
            return fireEvent('deselect_door');
        }

        if (this.lighting_enabled || CONFIG.quick_place) {
            return;
        }

        var new_wall = {
            p1x: this.SegmentManager.new_wall.start.x,
            p1y: this.SegmentManager.new_wall.start.y,
            p2x: Mouse.upX,
            p2y: Mouse.upY
        };

        // If the snap indicator is showing, then we dont want to put the point on the mouse
        // but where the indicator is showing instead.
        if (CONFIG.snap.indicator.show) {
            new_wall.p2x = CONFIG.snap.indicator.x;
            new_wall.p2y = CONFIG.snap.indicator.y;
        }

        this.last_quickplace_coord.x = new_wall.p2x;
        this.last_quickplace_coord.y = new_wall.p2y;

        fireEvent('add_segment', {
            segment: new_wall,
            door: CONFIG.create_door
        });
    }

    mouseMove () {
        // if (!Mouse.left && !CONFIG.create_one_way_wall) return;

        if (this.LightManager.selected_light) {
            fireEvent('light_move', {
                id: this.LightManager.selected_light.id,
                x: Mouse.x,
                y: Mouse.y
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
            this.CanvasManager.drawPlacements();

            if (CONFIG.quick_place) return;

            if (CONFIG.snap.end) {
                this.SegmentManager.checkForWallEnds({
                    show_indicator: true
                });
            }
            if (CONFIG.snap.line) {
                this.SegmentManager.checkForWallLines({
                    show_indicator: true
                });
            }
        }
    }

    dragDoor () {
        let selected_door = this.SegmentManager.selected_door;

        if (!selected_door.p1_grab && !selected_door.p2_grab) return;

        // Determine what point was grabbed and what point is stationary
        var point_to_move_x = null;
        var point_to_move_y = null;
        var still_point_x = null;
        var still_point_y = null;
        if (selected_door.p1_grab) {
            point_to_move_x = (selected_door.temp_p1x) ? 'temp_p1x' : 'p1x';
            point_to_move_y = (selected_door.temp_p1y) ? 'temp_p1y' : 'p1y';
            still_point_x = (selected_door.temp_p2x) ? 'temp_p2x' : 'p2x';
            still_point_y = (selected_door.temp_p2y) ? 'temp_p2y' : 'p2y';
        }
        if (selected_door.p2_grab) {
            point_to_move_x = (selected_door.temp_p2x) ? 'temp_p2x' : 'p2x';
            point_to_move_y = (selected_door.temp_p2y) ? 'temp_p2y' : 'p2y';
            still_point_x = (selected_door.temp_p1x) ? 'temp_p1x' : 'p1x';
            still_point_y = (selected_door.temp_p1y) ? 'temp_p1y' : 'p1y';
        }

        // Get the vector from the mouse to the part of
        // the door not moving (the hinge). The door will be
        // along this line
        var v1 = Mouse.x - selected_door[still_point_x];
        var v2 = Mouse.y - selected_door[still_point_y];

        // Get the unit fot that vector
        var v_mag = Math.sqrt((v1 * v1) + (v2 * v2));
        var u1 = v1 / v_mag;
        var u2 = v2 / v_mag;

        // If there is no length for the door, we need to get it.
        // There will never be a length the first time a door is dragged
        if (!selected_door.length) {
            selected_door.length = this.SegmentManager.segmentLength(selected_door);
        }

        // Unit vector * door length = new vector for door
        var d_u1 = u1 * selected_door.length;
        var d_u2 = u2 * selected_door.length;

        // Get the new temporary ending point for the door
        var new_p1 = selected_door[still_point_x] + d_u1;
        var new_p2 = selected_door[still_point_y] + d_u2;

        // No "temp" means this is the first time the door is being moved
        // otherwise its an update to an already opened door
        let point_info = {};
        if (point_to_move_x.indexOf('temp') === -1) {
            point_info['temp_' + point_to_move_x] = new_p1;
            point_info['temp_' + point_to_move_y] = new_p2;
        } else {
            point_info[point_to_move_x] = new_p1;
            point_info[point_to_move_y] = new_p2;
        }

        return fireEvent('door_drag', point_info);
    }

    enableLight () {
        this.lighting_enabled = true;
        this.SegmentManager.prepareSegments();
        this.CanvasManager.enableLight();
    }

    disableLight () {
        if (DISPLAY_WINDOW) return;
        this.lighting_enabled = false;
        this.SegmentManager.clearSegments();
        this.CanvasManager.disableLight();
    }

    onEvent (event, data) {
        switch (event) {
            case 'light_poly_update':
                if (DISPLAY_WINDOW) {
                    this.CanvasManager.drawLight({
                        force_update: true,
                        polys: data
                    });
                }
                break;

            case 'create_one_way_wall_toggled':
                this.CanvasManager.drawPlacements();
                this.CanvasManager.drawWallLines();
                break;

            case 'image_loaded':
                this.SegmentManager.updateBounds(data);
                if (DISPLAY_WINDOW) {
                    fireEvent('enable_light');
                }
                break;

            case 'enable_light':
                this.enableLight();
                break;

            case 'disable_light':
                this.disableLight();
                break;

            case 'switch_wall_door':
                this.SegmentManager.switchBetweenDoorAndWall(data);
                break;

            case 'quick_place_started':
            case 'quick_place_ended':
                this.CanvasManager.drawPlacements();
                break;

            case 'toggle_closest_door':
                this.SegmentManager.toggleClosestDoor(data);
                break;

            case 'add_light':
                this.LightManager.addLight(data);
                break;

            case 'add_segment':
                this.SegmentManager.addSegment(data);
                CONFIG.snap.indicator.show = false;
                this.CanvasManager.drawWallLines();
                this.CanvasManager.drawPlacements();
                if (this.lighting_enabled) {
                    this.SegmentManager.clearSegments();
                    this.SegmentManager.prepareSegments();
                    this.CanvasManager.drawLight({
                        force_update: true
                    });
                }
                break;

            case 'light_moved':
            case 'light_added':
                this.CanvasManager.drawLights();
                this.CanvasManager.drawLight();
                break;

            case 'light_move':
                this.LightManager.moveLight(data);
                break;

            case 'lights_cleared':
                this.CanvasManager.drawLights();
                break;

            case 'select_light':
                this.LightManager.selectLight(data);
                break;
            case 'deselect_light':
                this.LightManager.deselectLight();
                break;

            case 'select_door':
                this.SegmentManager.selectDoor(data);
                break;
            case 'deselect_door':
                this.SegmentManager.deselectDoor();
                break;

            case 'door_drag':
                this.SegmentManager.updateSelectedDoor(data);
                this.CanvasManager.drawPlacements();
                this.CanvasManager.drawLight({
                    force_update: true
                });

            case 'door_activated':
                this.CanvasManager.drawPlacements();
                this.CanvasManager.drawLight({
                    force_update: true
                });
                break;

            case 'draw_walls':
                this.CanvasManager.drawWallLines();
                break;

            case 'remove_one_way':
                this.CanvasManager.drawWallLines();
                break;

            case 'remove_closest':
                this.ObjectManager.removeClosest(data);
                break;

            case 'remove_light':
                this.LightManager.removeLight(data);
                this.CanvasManager.drawLights();
                this.CanvasManager.drawLight();
                break;
            case 'remove_wall':
                this.SegmentManager.removeWall(data);
                this.CanvasManager.drawWallLines();
                if (this.lighting_enabled) {
                    this.SegmentManager.clearSegments();
                    this.SegmentManager.prepareSegments();
                    this.CanvasManager.drawLight({
                        force_update: true
                    });
                }
                break;
            case 'remove_door':
                this.SegmentManager.removeDoor(data);
                this.CanvasManager.drawWallLines();
                if (this.lighting_enabled) {
                    this.SegmentManager.clearSegments();
                    this.SegmentManager.prepareSegments();
                    this.CanvasManager.drawLight({
                        force_update: true
                    });
                }
                break;

            case 'scroll_left':
                this.CanvasManager.scrollLeft();
                break;

            case 'scroll_right':
                this.CanvasManager.scrollRight();
                break;

            case 'scroll_up':
                this.CanvasManager.scrollUp();
                break;

            case 'scroll_down':
                this.CanvasManager.scrollDown();
                break;

            case 'zoom_in':
                this.setZoom(this.zoom + 0.025);
                break;

            case 'zoom_out':
                this.setZoom(this.zoom - 0.025);
                break;

            default:
                break;
        }
    }
}
module.exports = MapInstance;
