class LightManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

        this.selected_light = null;
        this.light_width = 10;

        const lights_data = (map || {}).lights_data || {};
        this.lights = lights_data.lights || {};
        this.lights_added = lights_data.lights_added || 0;
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

        var light_quadrant_key = QuadrantManager.getQuadrant(this.parent, light);
        var r = null;
        var s = null;
        var t1 = null;
        var t2 = null;
        var intersects = [];
        var closestPoint = null;
        for (let i = 0; i < QuadrantManager.angle_quadrants.length; ++i) {
            var angle_quadrant =  QuadrantManager.angle_quadrants[i];
            var angle_quadrant_key = QuadrantManager.angle_quadrants_key[i];

            var walls_to_check = QuadrantManager.getWalls(this.parent, light_quadrant_key, angle_quadrant_key);
            var walls_length = walls_to_check.length;

            for (let k = 0; k < angle_quadrant.length; ++k) {
                r = {
                    px : light.x,
                    py : light.y,
                    dx : angle_quadrant[k].x,
                    dy : angle_quadrant[k].y
                };

                s = null;
                t1 = null;
                t2 = null;

                closestPoint = {
                    x : null,
                    y : null,
                    t1 : null
                };

                for (var j = 0; j < walls_length; ++j) {
                    s = walls_to_check[j];
                    // Skip any doors that are open.
                    if (s.open) continue;

                    // Get any intersection info for this light ray and wall.
                    var info = this.getIntersection(r, {
                        px : s.temp_p1x || s.p1x,
                        py : s.temp_p1y || s.p1y,
                        dx : (s.temp_p2x || s.p2x) - (s.temp_p1x || s.p1x),
                        dy : (s.temp_p2y || s.p2y) - (s.temp_p1y || s.p1y)
                    });

                    // Continue to the next wall if there was no intersect info.
                    if (!info) continue;

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
                if (closestPoint.t1 != null) {
                    intersects.push(closestPoint);
                }
            }
        }

        // pos is the position of the light, and intersects are all the points it's light
        // rays hit. Connecting all those points together gives the polygon "lit area" that
        // this light can see.
        light.intersects = intersects;
        return {
            pos : {
                x : r.px,
                y : r.py
            },
            intersects : intersects
        };
    }

    getIntersection (r, s) {
        if ((r.dx / r.dy) == (s.dx / s.dy)) {
            return null;
        }

        var t2 = (r.dx * (s.py - r.py) + r.dy * (r.px - s.px)) / (s.dx * r.dy - s.dy * r.dx);
        var t1 = (r.dx != 0) ? (s.px + s.dx * t2 - r.px) / r.dx : (s.py + s.dy * t2 - r.py) / r.dy;

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
        fireEvent('light_poly_update', polys);
        return polys;
    }

    checkForLights () {
        var x1 = Mouse.x;
        var y1 = Mouse.y;
        var x2 = null;
        var y2 = null;

        var light = null;
        for (let l in this.lights) {
            light = this.lights[l];

            x2 = light.x;
            y2 = light.y;
            var x_sq = (x2 - x1) * (x2 - x1);
            var y_sq = (y2 - y1) * (y2 - y1);
            var dist = Math.sqrt(x_sq + y_sq);

            if (dist < this.light_width) {
                fireEvent('select_light', {
                    id: light.id
                });
                return true;
            }
        }

        return false;
    }

    selectLight (opts = {}) {
        this.selected_light = this.lights[opts.id];
    }

    deselectLight () {
        this.selected_light = null;
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
        fireEvent('light_added', new_light);
    }

    moveLight (opts) {
        opts = opts || {};
        this.lights[opts.id].x = opts.x;
        this.lights[opts.id].y = opts.y;
        fireEvent('light_moved');
    }

    removeLight (closest) {
        delete this.lights[closest.segment.id];
    }

    clearLights () {
        this.selected_light = null;
        this.lights = {};
        fireEvent('lights_cleared');
    }
}
module.exports = LightManager;
