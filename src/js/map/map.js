const CanvasManager = require('./canvas_manager');
const SegmentManager = require('./segment_manager');
const LightManager = require('./light_manager');
const LinkManager = require('./link_manager');
const ObjectManager = require('./object_manager');

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
        this.LinkManager = new LinkManager(map, this);
        this.ObjectManager = new ObjectManager(this);

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
        this.SegmentManager.closeAllDoors();
        // Lights are important, but not saved.
        // Only info to save goes in the json section
        return {
            name: this.name,
            json_directory: this.map.json_directory,
            // directory: this.map.directory,
            image: this.image,
            lights_data: {
                lights: this.LightManager.lights,
                lights_added: this.LightManager.lights_added
            },
            json: {
                walls: this.SegmentManager.walls,
                doors: this.SegmentManager.doors,
                light_links: this.LinkManager.links
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

    cancelPlacements () {
        this.LinkManager.clear();
        this.CanvasManager.drawPlacements();
        Toast.message('All in-progress placements have been canceled');
    }

    setZoom (new_zoom) {
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
                this.setZoom(this.zoom - 0.025);
                break;
            case KEYS.PLUS:
                this.setZoom(this.zoom + 0.025);
                break;
            case KEYS.SHIFT:
                fireEvent('quick_place_started');
                break;
            case KEYS.ESC:
                fireEvent('cancel_placements');
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
            case KEYS.L:
                fireEvent('place_link', point);
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
                // this.CanvasManager.scrollLeft();
                break;
            case KEYS.RIGHT:
                fireEvent('scroll_right');
                // this.CanvasManager.scrollRight();
                break;
            case KEYS.UP:
                fireEvent('scroll_up');
                // this.CanvasManager.scrollUp();
                break;
            case KEYS.DOWN:
                fireEvent('scroll_down');
                // this.CanvasManager.scrollDown();
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

        if (CONFIG.quick_place) {
            return fireEvent('add_segment', {
                segment: {
                    p1x: Mouse.upX,
                    p1y: Mouse.upY,
                    p2x: Mouse.downX,
                    p2y: Mouse.downY
                },
                door: CONFIG.create_door
            });
        }

        if (CONFIG.snap.end) {
            var point = this.SegmentManager.checkForWallEnds({
                show_indicator: false
            });
            if (point) {
                this.SegmentManager.new_wall.start.x = point.x;
                this.SegmentManager.new_wall.start.y = point.y;
                return;
            }
        }

        if (CONFIG.snap.line) {
            var point = this.SegmentManager.checkForWallLines({
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

    mouseUp () {
        if (!Mouse.left) return;

        if (this.LightManager.selected_light) {
            return fireEvent('deselect_light');
        }

        if (this.SegmentManager.selected_door) {
            return fireEvent('deselect_door');
        }

        if (this.lighting_enabled || CONFIG.quick_place) {
            return;
        }

        var new_wall = null;
        // If the snap indicator is showing, then we dont want to put the point on the mouse
        // but where the indicator is showing instead.
        if (CONFIG.snap.indicator.show) {
            new_wall = {
                p1x: this.SegmentManager.new_wall.start.x,
                p1y: this.SegmentManager.new_wall.start.y,
                p2x: CONFIG.snap.indicator.x,
                p2y: CONFIG.snap.indicator.y
            };
        } else {
            new_wall = {
                p1x: this.SegmentManager.new_wall.start.x,
                p1y: this.SegmentManager.new_wall.start.y,
                p2x: Mouse.upX,
                p2y: Mouse.upY
            };
        }

        fireEvent('add_segment', {
            segment: new_wall,
            door: CONFIG.create_door
        });
        this.CanvasManager.drawPlacements();
    }

    mouseMove () {
        if (Mouse.down && Mouse.left && DISPLAY_WINDOW) {
            this.CanvasManager.moveMap();
            return;
        }

        if (!Mouse.left) return;

        if (this.LightManager.selected_light) {
            fireEvent('light_move', {
                id: this.LightManager.selected_light.id,
                x: Mouse.x,
                y: Mouse.y
            });
            return;
        }

        if (this.lighting_enabled && this.SegmentManager.selected_door) {
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

            // If there is no length for the door, we need to get it
            if (!selected_door.length) {
                var seg_x = selected_door.p1x - selected_door.p2x;
                var seg_y = selected_door.p1y - selected_door.p2y;
                var seg_l = Math.sqrt((seg_x * seg_x) + (seg_y * seg_y));
                selected_door.length = seg_l;
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

            fireEvent('door_drag', point_info);

            return;
        }

        if (this.lighting_enabled) return;

        if (Mouse.down || CONFIG.quick_place) {
            this.CanvasManager.drawPlacements();
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

            case 'image_loaded':
                this.SegmentManager.updateBounds(data);
                if (DISPLAY_WINDOW) {
                    fireEvent('enable_light');
                }
                break;

            case 'first_light_link_placed':
                this.CanvasManager.drawPlacements();
                break;

            case 'second_light_link_placed':
                // Clear out the first Link drawn to the controls
                this.CanvasManager.drawPlacements();
                // Draw the complete link on the wall canvas
                this.CanvasManager.drawWallLines();
                break;

            case 'enable_light':
                this.enableLight();
                break;

            case 'disable_light':
                this.disableLight();
                break;

            case 'place_link':
                this.LinkManager.place(data);
                break;

            case 'cancel_placements':
                this.cancelPlacements();
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
            case 'remove_light_link':
                this.LinkManager.removeLink(data);
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

            default:
                break;
        }
    }
}
module.exports = MapInstance;
