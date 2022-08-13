const {
  pDistance,
  copyPoint
} = Lib.helpers;

const Base = require('./base');
class ObjectManager extends Base {
  constructor (opts = {}) {
    super(opts);

    Store.register({
      'remove_closest': this.removeClosest.bind(this),
    }, this.map_instance.name);
  }

  removeClosest (data = {}) {
    const point = data.point || copyPoint(Mouse);
    // Get the closest of each type of item, in order of priority
    let close_objects = ['light', 'segment', 'text_block'].map((search_type) => {
      return this.findClosest(search_type, point) || null;
    }).filter(x => x);

    let closest_object = {
      distance: 999999999,
      type: null
    };

    close_objects.forEach((close_object) => {
      // Since the list is in priority order we don't want equal distance items to win
      if (close_object.distance >= closest_object.distance) return;
      closest_object = close_object;
      // Special case for segments. If the segment is a one way wall only delete the one way portion
      if (close_object.type === 'segment' && close_object.segment.one_way) {
        delete closest_object.segment.one_way;
        closest_object.type = 'one_way';
      }
    });

    // Only allows lights to be removed if lighting is enabled
    if (Store.get('lighting_enabled') && !closest_object.type.match(/light/)) return;

    if (closest_object.type) {
      Store.fire('remove_' + closest_object.type, {
        object: closest_object
      });
    }
  }

  findClosest (type, point, distance_limit) {
    if (!type) return;
    point = point || copyPoint(Mouse);
    distance_limit = distance_limit || 50;

    let search_array = null;
    switch (type) {
      case 'segment':
        search_array = this.map_instance.managers.segment.segments;
        break;

      case 'light':
        search_array = [];
        for (let l in this.map_instance.managers.light.lights) {
          search_array.push(this.map_instance.managers.light.lights[l]);
        }
        break;

      case 'text_block':
        search_array = [];
        for (let t in this.map_instance.managers.text.text_blocks) {
          search_array.push(this.map_instance.managers.text.text_blocks[t]);
        }
        break;
    }

    if (!search_array || !search_array.length) return;

    let closest = {
      segment: null,
      index: null,
      distance: null,
      type: type,
    };

    search_array.forEach((segment, index) => {
      const segment_info = pDistance(point, segment);
      if (!closest.distance || segment_info.distance < closest.distance) {
        closest.distance = segment_info.distance;
        closest.segment = segment;
        closest.index = index;
      }
    });

    if (closest.distance > distance_limit) return null;
    return closest;
  }
}
module.exports = ObjectManager;
