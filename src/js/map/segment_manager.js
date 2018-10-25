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

        this.segments = this.joinSegments(this.walls, this.doors);
        this.segments_map = {};

        const loaded_segments = this.loadSegments((map.json || {}).segments || []);
        if (loaded_segments.length) this.segments = loaded_segments;

        this.generateSegmentMap();

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

        this.connected_segments = [];

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
        this.segments = this.segments.map((segment) => {
            let clean_segment = {
                p1: {
                    x: Math.round(segment.p1.x),
                    y: Math.round(segment.p1.y)
                },
                p2: {
                    x: Math.round(segment.p2.x),
                    y: Math.round(segment.p2.y)
                },
                type: segment.type
            };
            if (segment.type === 'wall' && segment.one_way) {
                clean_segment.one_way = {
                    open: {
                        x: Math.round(segment.one_way.open.x),
                        y: Math.round(segment.one_way.open.y)
                    },
                    closed: {
                        x: Math.round(segment.one_way.closed.x),
                        y: Math.round(segment.one_way.closed.y)
                    }
                };
            }
            return clean_segment;
        });
    }

    loadSegments (segment_array) {
        const timestamp = (new Date()).getTime();
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
            segment.id = this.createSegmentId(segment, timestamp);
            segment.type = segment.type || 'wall';
            return segment;
        });
    }

    joinSegments (walls, doors) {
        let segments = [];
        walls.forEach((wall) => {
            wall.type = 'wall';
            segments.push(wall);
        });
        doors.forEach((door) => {
            door.type = 'door';
            segments.push(door);
        });
        return segments;
    }

    createSegmentId (segment, timestamp) {
        if (!segment) {
            console.error('Could not create a valid segment ID');
            return null;
        }
        timestamp = timestamp || (new Date()).getTime();
        return `${segment.p1.x}${segment.p1.y}${segment.p2.x}${segment.p2.y}${timestamp}`;
    }

    generateSegmentMap () {
        this.segments.forEach((segment) => {
            this.segments_map[segment.id] = segment;
        });
    }

    prepareSegments () {
        // this.all_segments = this.allSegments();
        this.createQuadrants();
    }

	allSegments () {
        return this.segments.concat([
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
        ]);
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
        // Go through and put all of the walls into their respective quadrant.
        // Walls that cross quadrants go into both. This can result in duplicate
        // checks for a single wall, but overall the performance increase greatly
        // outweights this minor unoptimization
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

	addSegment (segment) {
		if (!segment) return;
		const s = this.finalizeSegment(segment);

		const x_sq = (s.p2.x - s.p1.x) * (s.p2.x - s.p1.x);
	    const y_sq = (s.p2.y - s.p1.y) * (s.p2.y - s.p1.y);
	    const dist = Math.sqrt(x_sq + y_sq);

        if (pointMatch(s.p1, s.p2)) {
            console.log('Wall/Door points are the same, not adding');
        } else if (((CONFIG.snap.end || CONFIG.snap.line) && !CONFIG.quick_place) && dist < CONFIG.snap.distance) {
            console.log('Wall/Door is too short, not adding');
        } else {
            this.segments.push(s);
            this.segments_map[s.id] = s;
        }
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

    moveWithMouse (control_point) {
        if (!control_point) return;

        const point = control_point.point;
        this.connected_segments.forEach((segment_id) => {
            const segment = this.segments_map[segment_id];
            segment[point.type] = copyPoint(Mouse);
        });

        // Update and set the control point after modifying the segments.
        control_point.point.x = Mouse.x;
        control_point.point.y = Mouse.y;

        Store.set({
            control_point: control_point
        });
    }

    findSegmentsWithPoint (point) {
        if (!point) return [];
        return this.segments.filter((segment) => {
            return pointMatch(segment.p1, point) || pointMatch(segment.p2, point);
        });
    }

    checkForDoors () {
        let segment = null;
        for (let i = 0; i < this.segments.length; ++i) {
            segment = this.segments[i];
            if (segment.type != 'door' || segment.open) continue;

            segment.p1_grab = false;
            segment.p2_grab = false;

            let dist = this.pointDistance(Mouse, segment.temp_p1 || segment.p1);
            if (dist <= CONFIG.door_grab_dist) {
                this.selectDoor({
                    index: i,
                    grab_point: 'p1'
                });
                return true;
            }

            dist = this.pointDistance(Mouse, segment.temp_p2 || segment.p2);
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
        this.selected_door = this.segments[index];
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
        this.segments.forEach((segment) => {
            delete segment.open;
        });
	}

    toggleClosestDoor (point) {
        if (!this.segments.length) return;

        let closest_segment = this.parent.ObjectManager.findClosest('segment', point);
        if (!closest_segment || closest_segment.segment.type !== 'door') return;
        const door = closest_segment.segment;

        if (door) {
            if (door.temp_p1 || door.temp_p2) {
                delete door.temp_p1;
                delete door.temp_p1;
                door.open = false;
            } else if (door.open) {
                door.open = false;
            } else {
                door.open = true;
            }

            if (!door.open) {
                SoundManager.play('close_door');
            } else {
                SoundManager.play('open_door');
            }

            Store.fire('door_activated');
        }
    }

    switchBetweenDoorAndWall (point) {
        point = point || copyPoint(Mouse);
        let closest_segment = this.parent.ObjectManager.findClosest('segment', point);
        if (!closest_segment) return;

        const type = closest_segment.segment.type;
        // wall to door or opposide will never need existing open data
        delete closest_segment.segment.open;
        if (!type || type === 'wall') {
            closest_segment.segment.type = 'door';
        } else {
            closest_segment.segment.type = 'wall';
        }

        Store.fire('draw_walls');
    }

    removeSegment (segment) {
        const seg_id = segment.id;
        // Remove the segment from the map
        delete this.segments_map[seg_id];
        // Refresh the segments array and remove the now dead segment
        this.segments = this.segments.filter((segment) => {
            return segment.id !== seg_id;
        });
    }

    getSegmentInfo (segment) {
        let i = null;
        for (i = 0; i < this.segments.length; ++i) {
            if (this.checkSegmentsMatch(segment, this.segments[i])) {
                return segment
            }
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
        this.connected_segments = [];
        let closest_end = {
            dist: null,
            point: {
                x: null,
                y: null,
                type: null
            },
            segment: null
        };

        for (let i = 0; i < this.segments.length; ++i) {
            const segment = this.segments[i];
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
        };

        if (closest_end.point) {
            // Get the IDs of all the segments that share the closest point found
            for (let i = 0; i < this.segments.length; ++i) {
                const segment = this.segments[i];
                if (pointMatch(segment.p1, closest_end.point, 1) || pointMatch(segment.p2, closest_end.point, 1)) {
                    this.connected_segments.push(segment.id);
                }
            }
        }

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

        // this.allSegments().forEach((segment) => {
        this.segments.forEach((segment) => {
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
        this.findSegmentsWithPoint(control_point).forEach((wall) => {
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
            this.removeSegment(this.getSegmentInfo(wall));
        });
        if (points.length === 2) {
            // Always make the new segment a wall
            this.addSegment({
                p1: {
                    x: points[0].x,
                    y: points[0].y
                },
                p2: {
                    x: points[1].x,
                    y: points[1].y
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
        this.removeSegment(info);

        const split_point = split_data.point || copyPoint(Mouse);
        const s = split_data.segment;
        this.addSegment({
            p1: {
                x: s.p1.x,
                y: s.p1.y
            },
            p2: {
                x: split_point.x,
                y: split_point.y
            },
            type: info.type
        });
        this.addSegment({
            p1: {
                x: s.p2.x,
                y: s.p2.y,
            },
            p2: {
                x: split_point.x,
                y: split_point.y
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
