const {
    pDistance,
    copyPoint
} = require('../../../lib/helpers');

class ObjectManager {
    constructor (parent) {
        this.parent = parent;

        Store.register({
            'remove_closest': this.removeClosest.bind(this),
        }, parent.name);
    }

    findClosest (type, point, distance_limit) {
        if (!type) return;
        point = point || copyPoint(Mouse);
        distance_limit = distance_limit || 50;

        let search_array = null;
        switch (type) {
            case 'segment':
                search_array = this.parent.SegmentManager.segments;
                break;
            case 'light':
                search_array = [];
                for (let l in this.parent.LightManager.lights) {
                    search_array.push(this.parent.LightManager.lights[l]);
                }
                break;
            case 'text_block':
                search_array = [];
                for (let t in this.parent.TextManager.text_blocks) {
                    search_array.push(this.parent.TextManager.text_blocks[t]);
                }
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
        let point = copyPoint(Mouse);
        if (data.point) point = data.point;

        const closest_light = this.findClosest('light', point);
        const closest_segment = this.findClosest('segment', point);
        const closest_text = this.findClosest('text_block', point);

        let closest = closest_segment || {
            reject: true,
            distance: 999999999
        };
        let item = 'segment';

        if (closest_light && closest_light.distance < closest.distance) {
            closest = closest_light;
            item = 'light';
        }

        if (closest_text && closest_text.distance < closest.distance) {
            closest = closest_text;
            item = 'text_block';
        }

        if (item === 'segment' && closest.segment && closest.segment.one_way) {
            delete closest.segment.one_way;
            item = 'one_way';
        }

        if (this.parent.lighting_enabled && (item !== 'light' || item !== 'text_block')) return;

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
