const Store = require('../store');

const {
    pDistance,
    copyPoint,
    sqr
} = require('../helpers');

class LightManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

        this.selected_light = null;
        this.light_width = 10;

        const lights_data = (map || {}).lights_data || {};
        this.lights = lights_data.lights || {};
        this.lights_added = lights_data.lights_added || 0;

        Store.register({
            'add_light': this.onAddLight.bind(this),
            'light_move': this.onLightMove.bind(this),
            'load_lights': this.loadLights.bind(this),
            'deselect_light': this.deselectLight.bind(this),
        }, parent.name);
    }

    onAddLight (data) {
       this.addLight(data.point);
    }

    onLightMove (data) {
        this.moveLight(data.light);
    }

    getLightPolygon (light, force_update) {
        light = light || {};

        // Any non-moving lights don't need to have their
        // intersect points recalculated.
        if (!force_update && light.intersects && light !== this.selected_light) {
            return {
                pos : {
                    x : light.x,
                    y : light.y
                },
                intersects : light.intersects || []
            };
        }

        const light_quadrant_key = QuadrantManager.getQuadrant(this.parent, light);

        let intersects = [];
        // Go through all of the angle quadrants TL, TR, BR, BL
        for (let quadrants_i = 0; quadrants_i < QuadrantManager.angle_quadrants.length; ++quadrants_i) {
            // Get the actual key for the quadrant (TL | TR | BR | BL)
            const quadrant_key = QuadrantManager.angle_quadrants_keys[quadrants_i];
            const segments_to_check = QuadrantManager.getSegments(this.parent, light_quadrant_key, quadrant_key);

            // Go through all of the angles in that quadrant (angle_amount / 4) length
            const quadrant_array = QuadrantManager.angle_quadrants[quadrants_i];
            for (let quadrant_i = 0; quadrant_i < quadrant_array.length; ++quadrant_i) {
                const vector = quadrant_array[quadrant_i];
                const r = {
                    px : light.x,
                    py : light.y,
                    dx : vector.x,
                    dy : vector.y
                };

                let closestPoint = {
                    x : null,
                    y : null,
                    t1 : null
                };

                // Go through all of the segments returned for that light/angle quadrant matchup
                for (let s_index = 0; s_index < segments_to_check.length; ++s_index) {
                    const s = segments_to_check[s_index];
                    // Skip any doors that are open.
                    if (s.open) continue;

                    // Get any intersection info for this light ray and wall.
                    const info = this.getIntersection(r, {
                        px : s.temp_p1 ? s.temp_p1.x : s.p1.x,
                        py : s.temp_p1 ? s.temp_p1.y : s.p1.y,
                        dx : (s.temp_p2 ? s.temp_p2.x : s.p2.x) - (s.temp_p1 ? s.temp_p1.x : s.p1.x),
                        dy : (s.temp_p2 ? s.temp_p2.y : s.p2.y) - (s.temp_p1 ? s.temp_p1.y : s.p1.y)
                    });

                    // Continue to the next wall if there was no intersect info.
                    if (!info) continue;

                    // We intersected a one way wall
                    if (s.one_way) {
                        let dist_open = pDistance(light, s.one_way.open).distance;
                        let dist_closed = pDistance(light, s.one_way.closed).distance;
                        // The open side is the side that is marked, so if we are closer to the
                        // closed side that means we can see through the wall
                        if (dist_open > dist_closed) continue;
                    }

                    // If there was intersect info, check if the intersected wall is
                    // closer than any previously found wall.
                    if (info.t1 >= 0 && info.t2 >= 0 && info.t2 <= 1) {
                        if (closestPoint.t1 == null || closestPoint.t1 > info.t1) {
                            closestPoint.x = info.x;
                            closestPoint.y = info.y;
                            closestPoint.t1 = info.t1;
                        }
                    }
                }

                // t1 is the distance, if there is no distance, something weird happened.
                // Either way, just ignore the wall and move on.
                if (closestPoint.t1 !== null) {
                    intersects.push({
                        x: Math.round(closestPoint.x),
                        y: Math.round(closestPoint.y)
                    });
                }
            };
        }

        // pos is the position of the light, and intersects are all the points it's light
        // rays hit. Connecting all those points together gives the polygon "lit area" that
        // this light can see.
        light.intersects = intersects;
        return {
            pos : {
                x : light.x,
                y : light.y
            },
            intersects : intersects
        };
    }

    getIntersection (r, s) {
        if ((r.dx / r.dy) == (s.dx / s.dy)) return null;

        const t2 = (r.dx * (s.py - r.py) + r.dy * (r.px - s.px)) / (s.dx * r.dy - s.dy * r.dx);
        const t1 = (r.dx != 0) ? (s.px + s.dx * t2 - r.px) / r.dx : (s.py + s.dy * t2 - r.py) / r.dy;

        return {
            x: r.px + (t1 * r.dx),
            y: r.py + (t1 * r.dy),
            t2: t2,
            t1: t1
        };
    }

    getAllLightPolygons (opts) {
        opts = opts || {};
        let polys = [];
        for (let l in this.lights) {
            polys.push(this.getLightPolygon(this.lights[l], opts.force_update));
        }
        // This event is only for the display window. When we're drawing
        Store.fire('light_poly_update', {
            polys: polys
        });
        this.light_polys = polys;
        return this.light_polys;
    }

    checkForLights () {
        const p1 = copyPoint(Mouse);
        let p2 = {
            x: null,
            y: null
        };

        let light = null;
        for (let l in this.lights) {
            light = this.lights[l];
            p2 = copyPoint(light);
            const dist = Math.sqrt(sqr(p2.x - p1.x) +  sqr(p2.y - p1.y));
            if (dist < this.light_width) {
                this.selected_light = light;
                return true;
            }
        }

        return false;
    }

    deselectLight () {
        this.selected_light = null;
    }

    loadLights (data) {
        data.lights.forEach((light) => {
            this.addLight(light);
        });
    }

    addLight (opts) {
        opts = opts || {};
        let new_light = {
            x: opts.x || Mouse.x,
            y: opts.y || Mouse.y,
            id: this.lights_added
        };
        this.lights[new_light.id] = new_light;
        this.lights_added++;
        Store.fire('light_added');
    }

    moveLight (opts) {
        opts = opts || {};
        this.lights[opts.id].x = opts.x;
        this.lights[opts.id].y = opts.y;
        Store.fire('light_moved');
    }

    removeLight (closest) {
        delete this.lights[closest.segment.id];
    }

    clearLights () {
        this.selected_light = null;
        this.lights = {};
        Store.fire('lights_cleared');
    }
}
module.exports = LightManager;
