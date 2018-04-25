const pDistance = require('../helpers').pDistance;

class LinkManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

        this.placing = false;
        this.placing_first = false;
        this.placing_second = false;

        this.links = (map.json || {}).light_links || [];

        this.first = {
            x: null,
            y: null,
        };

        this.second = {
            x: null,
            y: null
        };
    }

    removeLink (closest) {
        this.links.splice(closest.index, 1);
    }

    trigger () {
        if (!this.links.length || !this.parent.lighting_enabled) return;

        var link = null;
        var closest_link = null;
        var distance = null;

        for (var i = 0; i < this.links.length; ++i) {
            link = this.links[i];

            var link_info = pDistance(Mouse, link.first);
            if (!distance || link_info.distance < distance) {
                distance = link_info.distance;
                closest_link = link.second;
            }

            var link_info = pDistance(Mouse, link.second);
            if (!distance || link_info.distance < distance) {
                distance = link_info.distance;
                closest_link = link.first;
            }
        }

        if (closest_link) {
            fireEvent('add_light', {
                x: closest_link.x,
                y: closest_link.y
            });
        }
    }

    place (point) {
        point = point || {
            x: Mouse.x,
            y: Mouse.y
        };

        if (this.parent.lighting_enabled) {
            this.trigger();
            return;
        }

        if (!this.placing) {
            this.placing = true;
            this.placing_first = true;
            this.placing_second = false;
            Toast.message('Place the first Light Link on the map');
            return;
        }

        if (this.placing_first) {
            this.first.x = parseFloat(point.x.toFixed(2), 10);
            this.first.y = parseFloat(point.y.toFixed(2), 10);
            this.placing_first = false;
            this.placing_second = true;
            fireEvent('first_light_link_placed');
            Toast.message('Place the second Light Link on the map');
            return;
        }

        if (this.placing_second) {
            this.second.x = parseFloat(point.x.toFixed(2), 10);
            this.second.y = parseFloat(point.y.toFixed(2), 10);
            this.placing = false;
            this.placing_first = false;
            this.placing_second = false;
            this.links.push(JSON.parse(JSON.stringify({
                first: this.first,
                second: this.second
            })));
            this.clear();
            fireEvent('second_light_link_placed');
            Toast.message('Light Link successfully placed');
            return;
        }
    }

    clear () {
        this.placing = false;
        this.placing_first = false;
        this.placing_second = false;
        this.first = {
            x: null,
            y: null,
        };
        this.first = {
            x: null,
            y: null,
        };
    }
}
module.exports = LinkManager;
