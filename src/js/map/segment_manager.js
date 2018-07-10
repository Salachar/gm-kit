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

        this.new_wall = {
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        };

        this.all_segments = null;
    }

    sanitize () {
        this.walls.forEach((wall) => {
            wall.p1x = Math.round(wall.p1x);
            wall.p1y = Math.round(wall.p1y);

            wall.p2x = Math.round(wall.p2x);
            wall.p2y = Math.round(wall.p2y);

            if (wall.one_way) {
                wall.one_way.open.x = Math.round(wall.one_way.open.x);
                wall.one_way.open.y = Math.round(wall.one_way.open.y);

                wall.one_way.closed.x = Math.round(wall.one_way.closed.x);
                wall.one_way.closed.y = Math.round(wall.one_way.closed.y);
            }

            delete wall.length
        });

        this.doors.forEach((door) => {
            door.p1x = Math.round(door.p1x);
            door.p1y = Math.round(door.p1y);

            door.p2x = Math.round(door.p2x);
            door.p2y = Math.round(door.p2y);

            // Delete all the useless shit we don't need in the save data
            // for a door.
            delete door.temp_p1x;
            delete door.temp_p1y;
            delete door.temp_p2x;
            delete door.temp_p2y;
            delete door.length;
            delete door.open;
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
        for (var i = 0; i < quadrants.length; ++i) {
            switch (quadrants[i]) {
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
        }
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

    checkForDoors () {
        var x1 = Mouse.x;
        var y1 = Mouse.y;
        var x2 = null;
        var y2 = null;
        var door = null;

        for (var i = 0; i < this.doors.length; ++i) {
            door = this.doors[i];
            if (door.open) continue;

            door.p1_grab = false;
            door.p2_grab = false;

            x2 = door.temp_p1x || door.p1x;
            y2 = door.temp_p1y || door.p1y;

            var x_sq = (x2 - x1) * (x2 - x1);
            var y_sq = (y2 - y1) * (y2 - y1);
            var dist = Math.sqrt(x_sq + y_sq);

            if (dist <= CONFIG.door_grab_dist) {
                fireEvent('select_door', {
                    index: i,
                    grab_point: 'p1'
                });
                return true;
            }

            x2 = door.temp_p2x || door.p2x;
            y2 = door.temp_p2y || door.p2y;

            x_sq = (x2 - x1) * (x2 - x1);
            y_sq = (y2 - y1) * (y2 - y1);
            dist = Math.sqrt(x_sq + y_sq);

            if (dist <= CONFIG.door_grab_dist) {
                fireEvent('select_door', {
                    index: i,
                    grab_point: 'p2'
                });
                return true;
            }
        }

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
        for (var i = 0; i < this.doors.length; ++i) {
            this.doors[i].open = false;
        }
	}

    toggleClosestDoor (point) {
        if (!this.doors.length) return;

        var closest_door = this.parent.ObjectManager.findClosest('door', point);

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

            fireEvent('door_activated');
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

        fireEvent('draw_walls');
    }

    removeWall (closest) {
        this.walls.splice(closest.index, 1);
    }

    removeDoor (closest) {
        this.doors.splice(closest.index, 1);
    }

    checkForWallEnds (opts) {
        opts = opts || {};

        if (!this.walls.length) return;

        if (!CONFIG.snap.end) {
            CONFIG.snap.indicator.show = false;
            return;
        }

        var x1 = Mouse.x;
        var y1 = Mouse.y;
        CONFIG.snap.indicator.show = false;
        var x2 = null;
        var y2 = null;

        var segment = null;
        var segments = this.allSegments();
        for (var i = 0; i < segments.length; ++i) {
            segment = segments[i];

            x2 = segment.p1x;
            y2 = segment.p1y;
            var x_sq = (x2 - x1) * (x2 - x1);
            var y_sq = (y2 - y1) * (y2 - y1);
            var dist = Math.sqrt(x_sq + y_sq);

            if (dist < CONFIG.snap.distance) {
                CONFIG.snap.indicator.show = opts.show_indicator;
                CONFIG.snap.indicator.x = x2;
                CONFIG.snap.indicator.y = y2;
                return CONFIG.snap.indicator;
            }

            x2 = segment.p2x;
            y2 = segment.p2y;
            var x_sq = (x2 - x1) * (x2 - x1);
            var y_sq = (y2 - y1) * (y2 - y1);
            var dist = Math.sqrt(x_sq + y_sq);

            if (dist < CONFIG.snap.distance) {
                CONFIG.snap.indicator.show = opts.show_indicator;
                CONFIG.snap.indicator.x = x2;
                CONFIG.snap.indicator.y = y2;
                return CONFIG.snap.indicator;
            }
        }

        return null;
    }

    checkForWallLines (opts) {
        opts = opts || {};

        if (!this.walls.length) return;

        if (!CONFIG.snap.line) {
            CONFIG.snap.indicator.show = false;
            return;
        }

        var x1 = Mouse.x;
        var y1 = Mouse.y;
        CONFIG.snap.indicator.show = false;
        var x2 = null;
        var y2 = null;

        var segment = null;
        var segments = this.allSegments();

        var closest_segment = null;
        var closest_segment_info = null;
        var distance = null;
        for (var i = 0; i < segments.length; ++i) {
            segment = segments[i];
            var segment_info = pDistance(Mouse, segment);
            if (!distance || segment_info.distance < distance) {
                distance = segment_info.distance;
                closest_segment = segment;
                closest_segment_info = segment_info;
            }
        }

        if (closest_segment_info.distance < CONFIG.snap.distance) {
            CONFIG.snap.indicator.show = opts.show_indicator;
            CONFIG.snap.indicator.x = closest_segment_info.x;
            CONFIG.snap.indicator.y = closest_segment_info.y;
            return CONFIG.snap.indicator;
        }

        return null;
    }

	updateBounds (opts) {
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
