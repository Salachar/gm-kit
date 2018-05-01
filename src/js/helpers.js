const Helpers = {
    getWindowDimensions: function () {
        CONFIG.window_width = window.innerWidth;
        CONFIG.window_height = window.innerHeight;
    },

    randomRGBA: function (alpha) {
        alpha = (typeof alpha === 'number') ? alpha : 1;
        var r = Math.floor(Math.random() * 255 + 1);
        var g = Math.floor(Math.random() * 255 + 1);
        var b = Math.floor(Math.random() * 255 + 1);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    },

    // getIntersection: function (r, s) {
    //     if ((r.dx / r.dy) == (s.dx / s.dy)) {
    //         return null;
    //     }

    //     var t2 = (r.dx * (s.py - r.py) + r.dy * (r.px - s.px)) / (s.dx * r.dy - s.dy * r.dx);
    //     var t1 = (r.dx != 0) ? (s.px + s.dx * t2 - r.px) / r.dx : (s.py + s.dy * t2 - r.py) / r.dy;

    //     return {
    //         x: r.px + (t1 * r.dx),
    //         y: r.py + (t1 * r.dy),
    //         t2: t2,
    //         t1: t1
    //     };
    // },

    rgba: function (r,g,b,a) {
        a = (a || a === 0) ? a : 1;
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    },

    sqr: function (value) {
        return value * value;
    },

    pDistance: function (point, line, opts = {}) {
        if (!point || !line) return;
        if (line.segment) line = line.segment;

        // The line can also be a light, which will only have an X and a Y
        // In this case, just calculate the point to point distance and return.
        if (line.x && line.y && !line.p1x) {
            var distance = Math.sqrt(Helpers.sqr(line.x - point.x) + Helpers.sqr(line.y - point.y));
            return {
                distance: distance,
                x: line.x,
                y: line.y
            }
        }

        var A = point.x - line.p1x;
        var B = point.y - line.p1y;
        var C = line.p2x - line.p1x;
        var D = line.p2y - line.p1y;

        var dot = (A * C) + (B * D);
        var len_sq = (C * C) + (D * D);
        var param = -1;

        // In case of 0 length line
        if (len_sq != 0) {
            param = dot / len_sq;
        }

        var xx = 0;
        var yy = 0;

        if (param < 0) {
            xx = line.p1x;
            yy = line.p1y;
        } else if (param > 1) {
            xx = line.p2x;
            yy = line.p2y;
        } else {
            xx = line.p1x + param * C;
            yy = line.p1y + param * D;
        }

        var dx = point.x - xx;
        var dy = point.y - yy;

        return {
            distance: Math.sqrt(dx * dx + dy * dy),
            x: xx,
            y: yy
        }
    },

    getNormal (segment) {
        if (!segment) return;
        if (segment.segment) segment = segment.segment;

        // Get a perpendicular to the segment
        // let perp = {
        //     p1x: segment.p1x,
        //     p1y: segment.p1y,
        //     p2x: segment.p2y,
        //     p2y: segment.p2x * -1
        // };

        // Get a unit vector of that perpendicular
        let unit_vector = Helpers.getUnitVector(segment);

        let perp_unit_vector = {
            x: unit_vector.y,
            y: unit_vector.x * -1
        };

        // Get the middle of the origin segment
        let middle_point = Helpers.getSegmentMiddle(segment);

        // Add some distance to the unit normal (for show)
        let dist_mod = 20;
        let mod_vector = {
            x: perp_unit_vector.x * dist_mod,
            y: perp_unit_vector.y * dist_mod
        };

        let point_one = {
            x: middle_point.x + mod_vector.x,
            y: middle_point.y + mod_vector.y
        };

        let point_two = {
            x: middle_point.x - mod_vector.x,
            y: middle_point.y - mod_vector.y
        };

        let dist_one = Helpers.pDistance(Mouse, point_one);
        let dist_two = Helpers.pDistance(Mouse, point_two);

        if (dist_one.distance <= dist_two.distance) {
            return {
                open: point_one,
                closed: point_two
            };
        }
        return {
            open: point_two,
            closed: point_one
        };
        // return {
        //     x: middle_point.x + (unit_vector.x * 5),
        //     y: middle_point.y + (unit_vector.y * 5)
        // };
    },

    getUnitVector (segment) {
        let vector = {
            x: segment.p2x - segment.p1x,
            y: segment.p2y - segment.p1y
        };

        let mag = Math.sqrt(Helpers.sqr(vector.x) + Helpers.sqr(vector.y));

        return {
            x: vector.x / mag,
            y: vector.y / mag
        };
    },

    getSegmentMiddle (segment) {
        return {
            x: segment.p1x + ((segment.p2x - segment.p1x) * 0.5),
            y: segment.p1y + ((segment.p2y - segment.p1y) * 0.5)
        };
    },

    createElement: function (type, classes, opts) {
        opts = opts || {};
        let node = document.createElement(type);
        let classes_split = classes.split(' ');
        for (let i = 0; i < classes_split.length; ++i) {
            node.classList.add(classes_split[i]);
        }
        if (opts.attributes) {
            for (let attr in opts.attributes) {
                if (opts.attributes[attr]) {
                    node.setAttribute(attr, opts.attributes[attr]);
                }
            }
        }
        if (opts.dataset) {
            for (let data in opts.dataset) {
                if (opts.dataset[data]) {
                    node.dataset[data] = opts.dataset[data];
                }
            }
        }
        if (opts.events) {
            for (let event in opts.events) {
                node.addEventListener(event, opts.events[event]);
            }
        }
        if (opts.html) {
            node.innerHTML = opts.html;
        }
        if (opts.addTo) {
            opts.addTo.appendChild(node);
        }
        return node;
    }
};
module.exports = Helpers;
