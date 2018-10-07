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

        let closest = {
            segment: null,
            index: null,
            distance: null
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

    removeClosest (data) {
        let point = {
            x: Mouse.x,
            y: Mouse.y
        };
        if (data.point) point = data.point;

        var closest_light = this.findClosest('light', point);
        var closest_wall = this.findClosest('wall', point);
        var closest_door = this.findClosest('door', point);

        var closest = closest_wall || {
            reject: true,
            distance: 999999999
        };
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

        if (!closest.reject) {
            Store.fire('remove_' + item, {
                object: closest
            });
            return true;
        }

        return false;
    }
}
module.exports = ObjectManager;
