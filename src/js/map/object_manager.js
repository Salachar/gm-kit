const Store = require('../store');

const pDistance = require('../helpers').pDistance;

class ObjectManager {
    constructor (parent) {
        this.parent = parent;

        Store.register({
            'remove_closest': this.removeClosest.bind(this),
        }, parent.name);
    }

    findClosest (type, point, distance_limit) {
        if (!type) return;
        point = point || {
            x: Mouse.x,
            y: Mouse.y
        };
        distance_limit = distance_limit || 50;

        var search_array = null;
        switch (type) {
            case 'wall':
                search_array = this.parent.SegmentManager.walls;
                break;
            case 'light':
                // search_array = this.parent.LightManager.lights;
                search_array = [];
                for (var l in this.parent.LightManager.lights) {
                    search_array.push(this.parent.LightManager.lights[l]);
                }
                break;
            case 'door':
                search_array = this.parent.SegmentManager.doors;
                break;
        }

        if (!search_array || !search_array.length) return;

        var closest_segment = null;
        var segment = null;
        var segment_info = null;
        var index = null;
        var distance = null;

        for (var i = 0; i < search_array.length; ++i) {
            segment = search_array[i];
            if (segment.first && segment.second) {
                segment_info = pDistance(point, segment.first);
                if (!distance || segment_info.distance < distance) {
                    distance = segment_info.distance;
                    closest_segment = segment;
                    index = i;
                }
                segment_info = pDistance(point, segment.second);
                if (!distance || segment_info.distance < distance) {
                    distance = segment_info.distance;
                    closest_segment = segment;
                    index = i;
                }
            } else {
                segment_info = pDistance(point, segment);
                if (!distance || segment_info.distance < distance) {
                    distance = segment_info.distance;
                    closest_segment = segment;
                    index = i;
                }
            }
        }

        if (distance > distance_limit) return null;

        return {
            segment: closest_segment,
            distance: distance,
            index: index
        };
    }

    removeClosest (data) {
        let point = {
            x: Mouse.x,
            y: Mouse.y
        };
        if (data.point) point = data.point;

        var closest_light = this.findClosest('light', point);
        var closest_wall = this.findClosest('wall', point);
        var closest_door = this.findClosest('door', point);

        var closest = closest_wall || {distance: 999999999};
        var item = 'wall';

        if (closest_door && closest_door.distance < closest.distance) {
            closest = closest_door;
            item = 'door';
        }

        if (closest_light && closest_light.distance < closest.distance) {
            closest = closest_light;
            item = 'light';
        }

        if (item === 'wall' && closest.segment && closest.segment.one_way) {
            delete closest.segment.one_way;
            item = 'one_way';
        }

        if (this.parent.lighting_enabled && item !== 'light') return;

        if (closest) {
            Store.fire('remove_' + item, {
                object: closest
            });
            return true;
        }

        return false;
    }
}
module.exports = ObjectManager;
