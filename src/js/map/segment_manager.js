const Store = require('../store');

const pDistance = require('../helpers').pDistance;

class SegmentManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

    	this.walls = (map.json || {}).walls || [];
    	this.doors = (map.json || {}).doors || [];

        this.selected_door = null;

    	this.quadrants = {
    		TL: [],
    		TR: [],
    		BR: [],
    		BL: []
    	};

    	this.bounds = {
    		width: window.innerWidth,
    		height: window.innerHeight
    	};

        this.new_wall = null;

        this.all_segments = null;

        Store.register({
            'switch_wall_door': this.onSwitchWallDoor.bind(this),
            'image_loaded': this.onImageLoaded.bind(this),
            'toggle_closest_door': this.onToggleClosestDoor.bind(this),
            'deselect_door': this.deselectDoor.bind(this),
        }, parent.name);
    }

    onSwitchWallDoor (data) {
        this.switchBetweenDoorAndWall(data.point);
    }

    onImageLoaded (data) {
        this.updateBounds(data.image_dimensions);
        if (CONFIG.is_display) {
            Store.fire('enable_light');
        }
    }

    onToggleClosestDoor (data) {
        this.toggleClosestDoor(data.point);
    }

    sanitize () {
        this.walls = this.walls.map((wall) => {
            let new_wall = {
                p1x: Math.round(wall.p1x),
                p1y: Math.round(wall.p1y),
                p2x: Math.round(wall.p2x),
                p2y: Math.round(wall.p2y)
            };
            if (wall.one_way) {
                new_wall.one_way = {
                    open: {
                        x: Math.round(wall.one_way.open.x),
                        y: Math.round(wall.one_way.open.y)
                    },
                    closed: {
                        x: Math.round(wall.one_way.closed.x),
                        y: Math.round(wall.one_way.closed.y)
                    }
                };
            }
            return new_wall;
        });

        this.doors = this.doors.map((door) => {
            return {
                p1x: Math.round(door.p1x),
                p1y: Math.round(door.p1y),
                p2x: Math.round(door.p2x),
                p2y: Math.round(door.p2y)
            };
        });
    }

    prepareSegments () {
        this.all_segments = this.allSegments();
        this.createQuadrants();
    }

    clearSegments () {
        this.all_segments = null;
    }

	allSegments () {
		if (this.all_segments) return this.all_segments;

        return this.walls.concat([
            {
                p1x : 0,
                p1y : 0,
                p2x : this.bounds.width,
                p2y : 0
            },
            {
                p1x : this.bounds.width,
                p1y : 0,
                p2x : this.bounds.width,
                p2y : this.bounds.height
            },
            {
                p1x : this.bounds.width,
                p1y : this.bounds.height,
                p2x : 0,
                p2y : this.bounds.height
            },
            {
                p1x : 0,
                p1y : this.bounds.height,
                p2x : 0,
                p2y : 0
            }
        ]).concat(this.doors);
	}

    getQuadrantSegments (quadrants) {
        let total_segments = [];
        quadrants.forEach((quadrant) => {
            switch (quadrant) {
                case 'TL':
                    total_segments = total_segments.concat(this.quadrants.TL);
                    break;
                case 'TR':
                    total_segments = total_segments.concat(this.quadrants.TR);
                    break;
                case 'BR':
                    total_segments = total_segments.concat(this.quadrants.BR);
                    break;
                case 'BL':
                    total_segments = total_segments.concat(this.quadrants.BL);
                    break;
            }
        });
        return total_segments;
    }

	createQuadrants () {
		this.quadrants = {
			TL: [],
			TR: [],
			BR: [],
			BL: []
		};

		let x_bound = this.bounds.width / 2;
		let y_bound = this.bounds.height / 2;

		var s = null;
		let segments = this.allSegments();
		for (var i = 0; i < segments.length; ++i) {
			s = segments[i];

			var h_side = 'both'
			if (s.p1x < x_bound && s.p2x < x_bound) {
				h_side = 'left';
			} else if (s.p1x > x_bound && s.p2x > x_bound) {
				h_side = 'right';
			}

			var v_side = 'both';
			if (s.p1y < y_bound && s.p2y < y_bound) {
				v_side = 'top';
			} else if (s.p1y > y_bound && s.p2y > y_bound) {
				v_side = 'bottom';
			}

			var side = v_side + '_' + h_side;
			switch (side) {
				case 'both_both':
					this.quadrants.TL.push(s);
					this.quadrants.TR.push(s);
					this.quadrants.BR.push(s);
					this.quadrants.BL.push(s);
					break;
				case 'top_both':
					this.quadrants.TL.push(s);
					this.quadrants.TR.push(s);
					break;
				case 'bottom_both':
					this.quadrants.BR.push(s);
					this.quadrants.BL.push(s);
					break;
				case 'both_left':
					this.quadrants.TL.push(s);
					this.quadrants.BL.push(s);
					break;
				case 'both_right':
					this.quadrants.TR.push(s);
					this.quadrants.BR.push(s);
					break;
				case 'top_left':
					this.quadrants.TL.push(s);
					break;
				case 'top_right':
					this.quadrants.TR.push(s);
					break;
				case 'bottom_right':
					this.quadrants.BR.push(s);
					break;
				case 'bottom_left':
					this.quadrants.BL.push(s);
					break;
			}
		}
	}

	addSegment (opts) {
        opts = opts || {};
        let { door, segment } = opts;

		if (!segment) return;
		var s = this.finalizeSegment(segment);

		var x_sq = (s.p2x - s.p1x) * (s.p2x - s.p1x);
	    var y_sq = (s.p2y - s.p1y) * (s.p2y - s.p1y);
	    var dist = Math.sqrt(x_sq + y_sq);

	    if (s.p1x === s.p2x && s.p1y === s.p2y) {
	        console.log('Wall/Door points are the same, not adding');
	    } else if (((CONFIG.snap.end || CONFIG.snap.line) && !CONFIG.quick_place) && dist < CONFIG.snap.distance) {
	        console.log('Wall/Door is too short, not adding');
	    } else if (door) {
	        this.addDoor(s);
	    } else {
	        this.addWall(s);
	    }
	}

	finalizeSegment (segment) {
        // There is no reason to need floating point precicsion for pixel placement
        // All wall points will round the same up or down and will still "connect"
        // properly even after rounded
	    segment.p1x = Math.round(segment.p1x);
	    segment.p1y = Math.round(segment.p1y);
	    segment.p2x = Math.round(segment.p2x);
	    segment.p2y = Math.round(segment.p2y);
	    return segment;
	}

	segmentLength (segment) {
        // Currently only doors use this for the purpose of the door dragging
	    var seg_x = segment.p1x - segment.p2x;
	    var seg_y = segment.p1y - segment.p2y;
	    var seg_l = Math.sqrt((seg_x * seg_x) + (seg_y * seg_y));
	    return seg_l;
	}

	addWall (wall) {
		this.walls.push(wall);
	}

	addDoor (door) {
		this.doors.push(door);
	}

    moveWithMouse (wall_end) {
        if (!wall_end) return;
        const point = {
            x: wall_end.segment[wall_end.point + 'x'],
            y: wall_end.segment[wall_end.point + 'y']
        };
        this.findWallsWithPoint(point).forEach((wall) => {
            if (wall.p1x === point.x && wall.p1y === point.y) {
                wall.p1x = Mouse.x;
                wall.p1y = Mouse.y;
            }
            if (wall.p2x === point.x && wall.p2y === point.y) {
                wall.p2x = Mouse.x;
                wall.p2y = Mouse.y;
            }
        });
    }

    findWallsWithPoint (point) {
        if (!point) return [];
        return this.allSegments().filter((wall) => {
            if (wall.p1x === point.x && wall.p1y === point.y) return true;
            if (wall.p2x === point.x && wall.p2y === point.y) return true;
            return false;
        });
    }

    checkForDoors () {
        let door = null;
        for (let i = 0; i < this.doors.length; ++i) {
            door = this.doors[i];
            if (door.open) return;

            door.p1_grab = false;
            door.p2_grab = false;

            let dist = this.pointDistance(Mouse.x, Mouse.y, door.temp_p1x || door.p1x, door.temp_p1y || door.p1y);
            if (dist <= CONFIG.door_grab_dist) {
                this.selectDoor({
                    index: i,
                    grab_point: 'p1'
                });
                return true;
            }

            dist = this.pointDistance(Mouse.x, Mouse.y, door.temp_p2x || door.p2x, door.temp_p2y || door.p2y);
            if (dist <= CONFIG.door_grab_dist) {
                this.selectDoor({
                    index: i,
                    grab_point: 'p2'
                });
                return true;
            }
        };

        return false;
    }

    selectDoor (opts = {}) {
        const { index, grab_point } = opts;
        this.selected_door = this.doors[index];
        if (grab_point === 'p1') {
            this.selected_door.p1_grab = true;
        } else {
            this.selected_door.p2_grab = true;
        }
    }

    deselectDoor () {
        if (!this.selected_door) return;
        delete this.selected_door.p1_grab;
        delete this.selected_door.p2_grab;
        this.selected_door = null;
    }

    updateSelectedDoor (point = {}) {
        if (!this.selected_door) return;
        for (let p in point) {
            this.selected_door[p] = point[p];
        }
    }

	closeAllDoors () {
        this.doors.forEach((door) => {
            door.open = false;
        });
	}

    toggleClosestDoor (point) {
        if (!this.doors.length) return;

        let closest_door = this.parent.ObjectManager.findClosest('door', point);

        if (!closest_door) return;
        closest_door = closest_door.segment;

        if (closest_door) {
            if (closest_door.temp_p1x || closest_door.temp_p2x) {
                closest_door.temp_p1x = null;
                closest_door.temp_p1y = null;
                closest_door.temp_p2x = null;
                closest_door.temp_p2y = null;
                closest_door.open = false;
            } else if (closest_door.open) {
                closest_door.open = false;
            } else {
                closest_door.open = true;
            }

            if (!closest_door.open) {
                SoundManager.play('close_door');
            } else {
                SoundManager.play('open_door');
            }

            Store.fire('door_activated');
        }
    }

    switchBetweenDoorAndWall (point) {
        point = point || {
            x: Mouse.x,
            y: Mouse.y
        };
        var closest_door = this.parent.ObjectManager.findClosest('door', point);
        var closest_wall = this.parent.ObjectManager.findClosest('wall', point);

        if (!closest_wall && !closest_door) return;

        if (closest_wall && !closest_door) {
            this.walls.splice(closest_wall.index, 1);
            this.doors.push(closest_wall.segment);
        } else if (closest_door && !closest_wall) {
            this.doors.splice(closest_door.index, 1);
            delete closest_door.segment.open;
            this.walls.push(closest_door.segment);
        } else if (closest_wall.distance < closest_door.distance) {
            // WALL -> DOOR
            this.walls.splice(closest_wall.index, 1);
            this.doors.push(closest_wall.segment);
        } else {
            // DOOR -> WALL
            this.doors.splice(closest_door.index, 1);
            delete closest_door.segment.open;
            this.walls.push(closest_door.segment);
        }

        Store.fire('draw_walls');
    }

    removeWall (closest) {
        this.walls.splice(closest.index, 1);
    }

    removeDoor (closest) {
        this.doors.splice(closest.index, 1);
    }

    checkForWallEnds (opts = {}) {
        CONFIG.snap.indicator.show = false;
        if (!CONFIG.snap.end) return;

        const closest_end = this.findClosestWallEnd(CONFIG.snap.distance);
        if (!closest_end) return null;

        CONFIG.snap.indicator.show = opts.show_indicator;
        CONFIG.snap.indicator.x = closest_end.x;
        CONFIG.snap.indicator.y = closest_end.y;
        return CONFIG.snap.indicator;
    }

    findClosestWallEnd (distance = 20) {
        let closest_end = {
            dist: null,
            x: null,
            y: null,
            segment: null,
            point: null,
        };

        this.allSegments().forEach((segment) => {
            const dist1 = this.pointDistance(Mouse.x, Mouse.y, segment.p1x, segment.p1y);
            const dist2 = this.pointDistance(Mouse.x, Mouse.y, segment.p2x, segment.p2y);
            if (dist1 < distance || dist2 < distance) {
                if (closest_end.dist === null || dist1 < closest_end.dist) {
                    closest_end.dist = dist1;
                    closest_end.x = segment.p1x;
                    closest_end.y = segment.p1y;
                    closest_end.point = 'p1';
                    closest_end.segment = segment;
                }
                if (closest_end.dist === null || dist2 < closest_end.dist) {
                    closest_end.dist = dist2;
                    closest_end.x = segment.p2x;
                    closest_end.y = segment.p2y;
                    closest_end.point = 'p2';
                    closest_end.segment = segment;
                }
            }
        });

        return (closest_end.segment) ? closest_end : null;
    }

    pointDistance (x1, y1, x2, y2) {
        const x_sq = (x2 - x1) * (x2 - x1);
        const y_sq = (y2 - y1) * (y2 - y1);
        return Math.sqrt(x_sq + y_sq);
    }

    checkForWallLines (opts = {}) {
        if (!this.walls.length) return;
        CONFIG.snap.indicator.show = false;

        if (!CONFIG.snap.line) return;

        let closest_segment = null;
        let closest_segment_info = null;
        let distance = null;

        this.allSegments().forEach((segment) => {
            const segment_info = pDistance(Mouse, segment);
            if (!distance || segment_info.distance < distance) {
                distance = segment_info.distance;
                closest_segment = segment;
                closest_segment_info = segment_info;
            }
        });

        if (closest_segment_info.distance < CONFIG.snap.distance) {
            CONFIG.snap.indicator.show = opts.show_indicator;
            CONFIG.snap.indicator.x = closest_segment_info.x;
            CONFIG.snap.indicator.y = closest_segment_info.y;
            return CONFIG.snap.indicator;
        }

        return null;
    }

	updateBounds (opts) {
        console.log(opts);
		opts = opts || {};
		this.bounds.width = opts.width || CONFIG.map_image_width || this.bounds.width || 0;
		this.bounds.height = opts.height || CONFIG.map_image_height || this.bounds.height || 0;
		this.createQuadrants();
	}

	updateSegments (opts) {
		opts = opts || {};
		this.walls = opts.walls || [];
		this.doors = opts.doors || [];
	}
};
module.exports = SegmentManager;
