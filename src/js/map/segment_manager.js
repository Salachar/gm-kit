const Store = require('../store');

const Helpers = require('../helpers');
const pDistance = Helpers.pDistance;
const copyPoint = Helpers.copyPoint;
const pointMatch = Helpers.pointMatch;
const sqr = Helpers.sqr;

class SegmentManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

    	this.walls = this.loadSegments((map.json || {}).walls || []);
    	this.doors = this.loadSegments((map.json || {}).doors || []);

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
                p1: {
                    x: Math.round(wall.p1.x),
                    y: Math.round(wall.p1.y)
                },
                p2: {
                    x: Math.round(wall.p2.x),
                    y: Math.round(wall.p2.y)
                }
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
                p1: {
                    x: Math.round(door.p1.x),
                    y: Math.round(door.p1.y)
                },
                p2: {
                    x: Math.round(door.p2.x),
                    y: Math.round(door.p2.y)
                }
            };
        });
    }

    loadSegments (segment_array) {
        return segment_array.map((s) => {
            let segment = s;
            // legacy wall format
            if (s.p1x) {
                segment = {
                    p1: {
                        x: s.p1x,
                        y: s.p1y
                    },
                    p2: {
                        x: s.p2x,
                        y: s.p2y
                    }
                };
            }
            segment.id = this.createSegmentId(segment);
            return segment;
        });
    }

    createSegmentId (segment) {
        if (!segment) {
            console.error('Could not create a valid segment ID');
            return null;
        }
        return `${segment.p1.x}_${segment.p1.y}_${segment.p2.x}_${segment.p2.y}`;
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
                p1: {
                    x: 0,
                    y: 0
                },
                p2: {
                    x: this.bounds.width,
                    y : 0
                }
            },
            {
                p1: {
                    x: this.bounds.width,
                    y: 0
                },
                p2: {
                    x: this.bounds.width,
                    y: this.bounds.height
                }
            },
            {
                p1: {
                    x: this.bounds.width,
                    y: this.bounds.height
                },
                p2: {
                    x: 0,
                    y: this.bounds.height
                }
            },
            {
                p1: {
                    x : 0,
                    y: this.bounds.height
                },
                p2: {
                    x: 0,
                    y: 0
                }
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
		this.allSegments().forEach((s, i) => {
			let h_side = 'both'
			if (s.p1.x < x_bound && s.p2.x < x_bound) {
				h_side = 'left';
			} else if (s.p1.x > x_bound && s.p2.x > x_bound) {
				h_side = 'right';
			}

			let v_side = 'both';
			if (s.p1.y < y_bound && s.p2.y < y_bound) {
				v_side = 'top';
			} else if (s.p1.y > y_bound && s.p2.y > y_bound) {
				v_side = 'bottom';
			}

			let side = v_side + '_' + h_side;
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
		})
	}

	addSegment (opts) {
        opts = opts || {};
        let { type, door, segment } = opts;

		if (!segment) return;
		const s = this.finalizeSegment(segment);

		const x_sq = (s.p2.x - s.p1.x) * (s.p2.x - s.p1.x);
	    const y_sq = (s.p2.y - s.p1.y) * (s.p2.y - s.p1.y);
	    const dist = Math.sqrt(x_sq + y_sq);

        if (pointMatch(s.p1, s.p2)) {
	        console.log('Wall/Door points are the same, not adding');
	    } else if (((CONFIG.snap.end || CONFIG.snap.line) && !CONFIG.quick_place) && dist < CONFIG.snap.distance) {
	        console.log('Wall/Door is too short, not adding');
	    } else if (type === 'door' || door) {
	        this.addDoor(s);
	    } else {
	        this.addWall(s);
	    }

        this.clearSegments();
	}

	finalizeSegment (segment) {
        // There is no reason to need floating point precicsion for pixel placement
        // All wall points will round the same up or down and will still "connect"
        // properly even after rounded
	    segment.p1.x = Math.round(segment.p1.x);
	    segment.p1.y = Math.round(segment.p1.y);
	    segment.p2.x = Math.round(segment.p2.x);
	    segment.p2.y = Math.round(segment.p2.y);
        segment.id = this.createSegmentId(segment);
	    return segment;
	}

	segmentLength (segment) {
        // Currently only doors use this for the purpose of the door dragging
	    const seg_x = segment.p1.x - segment.p2.x;
	    const seg_y = segment.p1.y - segment.p2.y;
	    const seg_l = Math.sqrt(sqr(seg_x) + sqr(seg_y));
	    return seg_l;
	}

	addWall (wall) {
		this.walls.push(wall);
	}

	addDoor (door) {
		this.doors.push(door);
	}

    moveWithMouse (control_point) {
        if (!control_point) return;

        const point = control_point.point;
        this.findWallsWithPoint(point).forEach((wall) => {
            if (pointMatch(wall.p1, point)) {
                wall.p1 = copyPoint(Mouse);
            }
            if (pointMatch(wall.p2, point)) {
                wall.p2 = copyPoint(Mouse);
            }
        });

        // Update and set the control point after modifying the segments.
        control_point.point.x = Mouse.x;
        control_point.point.y = Mouse.y;

        Store.set({
            control_point: control_point
        });
    }

    findWallsWithPoint (point) {
        if (!point) return [];
        return this.allSegments().filter((wall) => {
            return pointMatch(wall.p1, point) || pointMatch(wall.p2, point);
        });
    }

    checkForDoors () {
        let door = null;
        for (let i = 0; i < this.doors.length; ++i) {
            door = this.doors[i];
            if (door.open) return;

            door.p1_grab = false;
            door.p2_grab = false;

            let dist = this.pointDistance(Mouse, door.temp_p1 || door.p1);
            if (dist <= CONFIG.door_grab_dist) {
                this.selectDoor({
                    index: i,
                    grab_point: 'p1'
                });
                return true;
            }

            dist = this.pointDistance(Mouse, door.temp_p2 || door.p2);
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
            if (closest_door.temp_p1 || closest_door.temp_p2) {
                delete closest_door.temp_p1;
                delete closest_door.temp_p1;
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
        point = point || copyPoint(Mouse);
        let closest_door = this.parent.ObjectManager.findClosest('door', point);
        let closest_wall = this.parent.ObjectManager.findClosest('wall', point);

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

    remove (info) {
        if (!info) return;
        if (info.type === 'wall') {
            this.removeWall(info);
        } else if (info.type === 'door') {
            this.removeDoor(info);
        }
    }

    removeWall (closest) {
        this.walls.splice(closest.index, 1);
    }

    removeDoor (closest) {
        this.doors.splice(closest.index, 1);
    }

    getSegmentInfo (segment) {
        let i = null;
        for (i = 0; i < this.walls.length; ++i) {
            if (this.checkSegmentsMatch(segment, this.walls[i])) {
                return {
                    segment: segment,
                    index: i,
                    type: 'wall'
                };
            }
        }
        for (i = 0; i < this.doors.length; ++i) {
            if (this.checkSegmentsMatch(segment, this.doors[i])) {
                return {
                    segment: segment,
                    index: i,
                    type: 'door'
                };
            };
        }
        return null;
    }

    checkSegmentsMatch (s1, s2) {
        if (s1.p1.x === s2.p1.x &&
            s1.p2.x === s2.p2.x &&
            s1.p1.y === s2.p1.y &&
            s1.p2.y === s2.p2.y) {
            return true;
        }
        return false;
    }

    checkForWallEnds (opts = {}) {
        CONFIG.snap.indicator.show = false;
        CONFIG.snap.indicator.point = null;
        CONFIG.snap.indicator.segment = null;

        const closest_end = this.findClosestWallEnd(CONFIG.snap.distance);
        if (!closest_end) return null;

        CONFIG.snap.indicator.show = opts.show_indicator;
        CONFIG.snap.indicator.point = copyPoint(closest_end.point);
        return CONFIG.snap.indicator;
    }

    findClosestWallEnd (distance = CONFIG.snap.distance) {
        let closest_end = {
            dist: null,
            point: {
                x: null,
                y: null,
                type: null
            },
            segment: null
        };

        this.allSegments().forEach((segment) => {
            const dist1 = this.pointDistance(Mouse, segment.p1);
            const dist2 = this.pointDistance(Mouse, segment.p2);
            if (dist1 < distance || dist2 < distance) {
                if (closest_end.dist === null || dist1 < closest_end.dist) {
                    closest_end.dist = dist1;
                    closest_end.point = {
                        x: segment.p1.x,
                        y: segment.p1.y,
                        type: 'p1'
                    };
                    closest_end.segment = segment;
                }
                if (closest_end.dist === null || dist2 < closest_end.dist) {
                    closest_end.dist = dist2;
                    closest_end.point = {
                        x: segment.p2.x,
                        y: segment.p2.y,
                        type: 'p2'
                    };
                    closest_end.segment = segment;
                }
            }
        });

        return (closest_end.segment) ? closest_end : null;
    }

    pointDistance (p1, p2) {
        const x_sq = (p2.x - p1.x) * (p2.x - p1.x);
        const y_sq = (p2.y - p1.y) * (p2.y - p1.y);
        return Math.sqrt(x_sq + y_sq);
    }

    checkForWallLines (opts = {}) {
        CONFIG.snap.indicator.show = false;
        CONFIG.snap.indicator.point = null;
        CONFIG.snap.indicator.segment = null;

        const closest_point = this.getClosestPointOnSegment({
            distance: CONFIG.snap.distance
        });
        if (!closest_point) return null;

        CONFIG.snap.indicator.show = opts.show_indicator;
        CONFIG.snap.indicator.point = copyPoint(closest_point.point);
        CONFIG.snap.indicator.segment = closest_point.segment;
        return CONFIG.snap.indicator;
    }

    getClosestPointOnSegment (opts = {}) {
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

        if (closest_segment_info.distance < (opts.distance || 10)) {
            return {
                point: {
                    x: Math.round(closest_segment_info.x),
                    y: Math.round(closest_segment_info.y)
                },
                segment: closest_segment,
                dist: closest_segment_info.distance
            };
        }

        return null;
    }

    getControlPoint () {
        let point = this.parent.SegmentManager.findClosestWallEnd();
        let end = true;
        if (!point) {
            point = this.parent.SegmentManager.getClosestPointOnSegment({
                distance: CONFIG.move_point_dist
            });
            end = false;
        }
        if (point) point.end = end;
        return point;
    }

    handleControlPoint (control_point = {}) {
        if (!control_point) return;
        if (control_point.end === true) {
            return this.moveWithMouse(control_point);
        } else if (control_point.end === false) {
            return this.splitWall(control_point);
        }
    }

    removePoint (control_point = {}) {
        if (!control_point || control_point.end === false) return;

        let points = [];
        this.findWallsWithPoint(control_point).forEach((wall) => {
            if (wall.p1.x !== control_point.x || wall.p1.y !== control_point.y) {
                points.push({
                    x: wall.p1.x,
                    y: wall.p1.y
                });
            }
            if (wall.p2.x !== control_point.x || wall.p2.y !== control_point.y) {
                points.push({
                    x: wall.p2.x,
                    y: wall.p2.y
                });
            }
            this.remove(this.getSegmentInfo(wall));
        });
        if (points.length === 2) {
            this.addSegment({
                segment: {
                    p1: {
                        x: points[0].x,
                        y: points[0].y
                    },
                    p2: {
                        x: points[1].x,
                        y: points[1].y
                    }
                },
                type: 'wall'
            });
        }

        Store.fire('remove_point', {
            point: control_point
        });
    }

    splitWall (split_data) {
        const info = this.getSegmentInfo(split_data.segment);
        this.remove(info);

        const split_point = split_data.point || copyPoint(Mouse);
        const s = split_data.segment;
        this.addSegment({
            segment: {
                p1: {
                    x: s.p1.x,
                    y: s.p1.y
                },
                p2: {
                    x: split_point.x,
                    y: split_point.y
                }
            },
            type: info.type
        });
        this.addSegment({
            segment: {
                p1: {
                    x: s.p2.x,
                    y: s.p2.y,
                },
                p2: {
                    x: split_point.x,
                    y: split_point.y
                }
            },
            type: info.type
        });

        Store.set({
            control_point: this.getControlPoint()
        });
    }

	updateBounds (opts) {
		opts = opts || {};
		this.bounds.width = opts.width || CONFIG.map_image_width || this.bounds.width || 0;
		this.bounds.height = opts.height || CONFIG.map_image_height || this.bounds.height || 0;
		this.createQuadrants();
	}
};
module.exports = SegmentManager;
