const {
  copy,
  pDistance,
  copyPoint,
  pointMatch,
  sqr,
  resetSnap,
  getNormal,
} = Lib.helpers

const Base = require('./base');
class SegmentManager extends Base {
  constructor (opts = {}) {
    super(opts)

    this.segments = null;
    this.all_segments = null;
    this.segments_map = {};

    this.selected_door = null;
    this.new_wall = null;

    this.initializeSegments();
    this.generateSegmentMap();

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

    Store.register({
      'prepare_segments': this.prepareSegments.bind(this),
      'switch_wall_door': this.switchBetweenDoorAndWall.bind(this),
      'toggle_closest_door': this.toggleClosestDoor.bind(this),
      'deselect_door': this.deselectDoor.bind(this),
      'image_loaded_(ps)': this.onImageLoaded.bind(this)
    }, this.map_instance.name);
  }

  initializeSegments () {
    // LEGACY: JSON data has the segments split into "walls" and "doors" sections
    const is_legacy = (this.map_data.json.walls || []).length > 0;
    if (is_legacy) {
      this.walls = this.loadSegments(this.map_data.json.walls || []);
      this.doors = this.loadSegments(this.map_data.json.doors || []);
      this.segments = this.joinSegments(this.walls, this.doors);
      Toast.message(`Map "${this.map_instance.name}" is using legacy JSON, re-saving is recommended`);
    } else {
      // Newer map JSON has everything as segments with type determining wall|door|etc
      // const loaded_segments = this.loadSegments(this.map_data.json.segments || []);
      // if (loaded_segments.length) this.segments = loaded_segments;
      this.segments = this.loadSegments(this.map_data.json.segments || []);
    }
  }

  onImageLoaded (data) {
    this.updateBounds(data.image_dimensions);
    if (CONFIG.is_player_screen) {
      Store.fire('enable_light');
    }
  }

  sanitizedSegments () {
    return this.segments.map((segment) => {
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
    // Legacy function for older map JSON
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
    this.createQuadrants();
  }

	allSegments () {
    const w = this.bounds.width;
    const h = this.bounds.height;
    // Add in the four bounding segments of the map
    return this.segments.concat([
      {
        p1: { x: 0, y: 0 },
        p2: { x: w, y: 0 }
      },
      {
        p1: { x: w, y: 0 },
        p2: { x: w, y: h }
      },
      {
        p1: { x: w, y: h },
        p2: { x: 0, y: h }
      },
      {
        p1: { x: 0, y: h },
        p2: { x: 0, y: 0 }
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
      let quads = [];

			switch (side) {
				case 'both_both':
          quads = ['TL', 'TR', 'BR', 'BL'];
					break;
				case 'top_both':
          quads = ['TL', 'TR'];
					break;
				case 'bottom_both':
          quads = ['BR', 'BL'];
					break;
				case 'both_left':
          quads = ['TL', 'BL'];
					break;
				case 'both_right':
          quads = ['TR', 'BR'];
					break;
				case 'top_left':
          quads = ['TL'];
					break;
				case 'top_right':
          quads = ['TR'];
					break;
				case 'bottom_right':
          quads = ['BR'];
					break;
				case 'bottom_left':
          quads = ['BL'];
					break;
			}

      quads.forEach((quad) => {
        this.quadrants[quad].push(s);
      });
		});
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

  moveWithMouse (control_point = {}) {
    if (!control_point) return;

    const point = control_point.point;
    this.segments.forEach((segment) => {
      if (pointMatch(point, segment.p1, 1)) {
        segment.p1 = copyPoint(Mouse);
      }
      if (pointMatch(point, segment.p2, 1)) {
        segment.p2 = copyPoint(Mouse);
      }
      if (segment.one_way) {
        segment.one_way = getNormal(segment, segment.one_way.open);
      }
    });

    // Update and set the control point after modifying the segments.
    control_point.point.x = Mouse.x;
    control_point.point.y = Mouse.y;

    Store.set({
      control_point: control_point
    });
  }

  findSegmentsWithPoint (point, opts = {}) {
    if (!point) return [];

    return this.segments.filter((segment) => {
      const dist_info = pDistance(point, segment, {
        line_only: opts.line_only || false
      });

      if (!dist_info.distance) return false;
      return (dist_info.distance < 1);
    });
  }

  checkForDoors () {
    let segment = null;
    for (let i = 0; i < this.segments.length; ++i) {
      segment = this.segments[i];
      if (segment.type != 'door' || segment.open) continue;

      segment.p1_grab = false;
      segment.p2_grab = false;

      let dist = pDistance(Mouse, segment.temp_p1 || segment.p1).distance || 9999999999;
      if (dist <= CONFIG.door_grab_dist) {
        this.selectDoor({
          index: i,
          grab_point: 'p1'
        });
        return true;
      }

      dist = pDistance(Mouse, segment.temp_p2 || segment.p2).distance || 9999999999;
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

  toggleClosestDoor (data) {
    const point = data.point || {};
    if (!this.segments.length) return;

    let closest_segment = this.map_instance.managers.object.findClosest('segment', point);
    if (!closest_segment || closest_segment.segment.type !== 'door') return;
    const door = closest_segment.segment;

    if (door) {
      // Toggling on an ajar door will reset it to closed
      if (door.temp_p1 || door.temp_p2) {
        delete door.temp_p1;
        delete door.temp_p2;
        door.open = false;
      } else if (door.open) {
        door.open = false;
      } else {
        door.open = true;
      }

      Store.fire('door_activated');
    }
  }

  switchBetweenDoorAndWall (data = {}) {
    const point = data.point || copyPoint(Mouse);
    let closest_segment = this.map_instance.managers.object.findClosest('segment', point);
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
    if (!segment || !segment.id) {
      console.error('Segment does not exist or has no ID');
      return;
    }
    const seg_id = segment.id;
    // Remove the segment from the map
    delete this.segments_map[seg_id];
    // Refresh the segments array and remove the now dead segment
    this.segments = this.segments.filter((segment) => {
      return segment.id !== seg_id;
    });
  }

  checkSegmentsMatch (s1, s2) {
    // If p1 and p2 are the same
    if (s1.p1.x === s2.p1.x &&
      s1.p2.x === s2.p2.x &&
      s1.p1.y === s2.p1.y &&
      s1.p2.y === s2.p2.y) {
      return true;
    }
    // If p1 and p2 are swapped (still matching segment)
    if (s1.p1.x === s2.p2.x &&
      s1.p2.x === s2.p1.x &&
      s1.p1.y === s2.p2.y &&
      s1.p2.y === s2.p1.y) {
      return true;
    }
    return false;
  }

  segmentExists (segment) {
    for (let i = 0; i < this.segments.length; ++i) {
      if (this.checkSegmentsMatch(segment, this.segments[i])) return true;
    }
    return false;
  }

  checkForWallEnds (opts = {}) {
    resetSnap();
    const closest_end = this.findClosestWallEnd(CONFIG.snap.distance, opts);
    if (!closest_end) return null;

    CONFIG.snap.indicator.show = opts.show_indicator;
    CONFIG.snap.indicator.point = copyPoint(closest_end.point);
    return CONFIG.snap.indicator;
  }

  findClosestWallEnd (snap_distance = CONFIG.snap.distance, opts = {}) {
    let closest_end = null;

    const exclude = opts.exclude;
    this.segments.forEach((segment) => {
      // Does either segment point match the point to exclude
      if (exclude) {
        if (pointMatch(exclude, segment.p1, 1)) return;
        if (pointMatch(exclude, segment.p2, 1)) return;
      }

      ['p1', 'p2'].forEach((point) => {
        const dist = pDistance(Mouse, segment[point]).distance || 999999999;
        if (dist < snap_distance && (!closest_end || dist < closest_end.dist)) {
          closest_end = {
            dist: dist,
            point: {
              x: segment[point].x,
              y: segment[point].y,
              type: point
            },
            segment: segment
          };
        }
      });
    });

    return closest_end || null;
  }

  checkForWallLines (opts = {}) {
    resetSnap();

    const closest_point = this.getClosestPointOnSegment({
      distance: CONFIG.snap.distance,
      exclude: opts.exclude
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
    const exclude = opts.exclude;

    this.segments.forEach((segment) => {
      if (exclude) {
        if (pointMatch(exclude, segment.p1, 1)) return;
        if (pointMatch(exclude, segment.p2, 1)) return;
      }

      const segment_info = pDistance(Mouse, segment);
      if (!distance || segment_info.distance < distance) {
        distance = segment_info.distance;
        closest_segment = segment;
        closest_segment_info = segment_info;
      }
    });

    if (closest_segment_info && closest_segment_info.distance < (opts.distance || 10)) {
      return {
        dist: closest_segment_info.distance,
        point: {
          x: Math.round(closest_segment_info.x),
          y: Math.round(closest_segment_info.y)
        },
        segment: closest_segment
      };
    }

    return null;
  }

  getControlPoint () {
    let point = this.map_instance.managers.segment.findClosestWallEnd();
    let end = true;
    if (!point) {
      point = this.map_instance.managers.segment.getClosestPointOnSegment({
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
    this.findSegmentsWithPoint(control_point.point).forEach((wall) => {
      if (wall.p1.x !== control_point.point.x || wall.p1.y !== control_point.point.y) {
        points.push({
          x: wall.p1.x,
          y: wall.p1.y
        });
      }
      if (wall.p2.x !== control_point.point.x || wall.p2.y !== control_point.point.y) {
        points.push({
          x: wall.p2.x,
          y: wall.p2.y
        });
      }
      this.removeSegment(wall);
    });

    if (points.length === 2) {
      // Always make the new segment a wall
      this.addSegment({
        segment: {
          p1: {
            x: points[0].x,
            y: points[0].y
          },
          p2: {
            x: points[1].x,
            y: points[1].y
          },
          type: 'wall'
        }
      });
    }

    Store.fire('remove_point', {
      point: control_point
    });
  }

  splitWall (split_data) {
    if (split_data.new_segment) {
      return this.splitWalls(split_data.new_segment);
    }

    if (!split_data.segment.id) return;

    const split_point = split_data.point || copyPoint(Mouse);
    const s = split_data.segment;

    this.splitSegment(s, split_point);

    Store.set({
      control_point: this.getControlPoint()
    });
  }

  splitSegment (segment, point) {
    // Split a segment at a given point
    this.removeSegment(segment);

    const new_segment_base = {
      p2: {
        x: point.x,
        y: point.y
      },
      type: segment.type
    };

    let new_seg_one = copy(new_segment_base);
    let new_seg_two = copy(new_segment_base);

    new_seg_one.p1 = {
      x: segment.p1.x,
      y: segment.p1.y
    };
    new_seg_two.p1 = {
      x: segment.p2.x,
      y: segment.p2.y,
    };

    if (segment.one_way) {
      new_seg_one.one_way = getNormal(new_seg_one, segment.one_way.open);
      new_seg_two.one_way = getNormal(new_seg_two, segment.one_way.open);
    }

    this.addSegment({
      segment: new_seg_one
    });
    this.addSegment({
      segment: new_seg_two
    });
  }

  addSegment (opts = {}) {
    const { segment } = opts;
		if (!segment) return;
    const s = this.finalizeSegment(segment);

    if (this.segmentExists(s)) {
      console.log('Segment with these points already exists');
    } else if (pointMatch(s.p1, s.p2)) {
      console.log('Wall/Door points are the same, not adding');
    } else {
      this.segments.push(s);
      this.segments_map[s.id] = s;
    }
	}

  splitWalls (new_wall) {
    // Split any walls the wall has endpoints on
    this.findSegmentsWithPoint(new_wall.p1, {
      line_only: true
    }).forEach((segment) => {
      this.splitSegment(segment, new_wall.p1);
    });

    this.findSegmentsWithPoint(new_wall.p2, {
      line_only: true
    }).forEach((segment) => {
      this.splitSegment(segment, new_wall.p2);
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
