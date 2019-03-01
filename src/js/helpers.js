
const Helpers = {
    resetSnap: function () {
        CONFIG.snap.indicator.show = false;
        CONFIG.snap.indicator.point = null;
        CONFIG.snap.indicator.segment = null;
    },

    copy: function (object) {
        return JSON.parse(JSON.stringify(object));
    },

    copyPoint: function (point_to_copy) {
        if (!point_to_copy || !point_to_copy.x || !point_to_copy.y) return null;
        return {
            x: point_to_copy.x || null,
            y: point_to_copy.y || null
        };
    },

    pointMatch: function (p1, p2, tolerance) {
        tolerance = tolerance || 0;
        return (Math.abs(p1.x - p2.x) <= tolerance && Math.abs(p1.y - p2.y) <= tolerance);
    },

    getWindowDimensions: function () {
        CONFIG.window_width = window.innerWidth;
        CONFIG.window_height = window.innerHeight;
    },

    isBlankPixel: function (pixel) {
        if (pixel.a === 0) return true;
        if (!pixel.r && !pixel.g && !pixel.b) return true;
        return false;
    },

    randomRGBA: function (alpha) {
        alpha = (typeof alpha === 'number') ? alpha : 1;
        const r = Math.floor(Math.random() * 255 + 1);
        const g = Math.floor(Math.random() * 255 + 1);
        const b = Math.floor(Math.random() * 255 + 1);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    },

    // getIntersection: function (r, s) {
    //     if ((r.dx / r.dy) == (s.dx / s.dy)) {
    //         return null;
    //     }

    //     let t2 = (r.dx * (s.py - r.py) + r.dy * (r.px - s.px)) / (s.dx * r.dy - s.dy * r.dx);
    //     let t1 = (r.dx != 0) ? (s.px + s.dx * t2 - r.px) / r.dx : (s.py + s.dy * t2 - r.py) / r.dy;

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
        if (line.x && line.y && !line.p1) {
            return {
                distance: Math.sqrt(Helpers.sqr(line.x - point.x) + Helpers.sqr(line.y - point.y)),
                x: line.x,
                y: line.y
            }
        }

        const A = point.x - line.p1.x;
        const B = point.y - line.p1.y;
        const C = line.p2.x - line.p1.x;
        const D = line.p2.y - line.p1.y;

        const dot = (A * C) + (B * D);
        const len_sq = (C * C) + (D * D);
        const param = (len_sq !== 0) ? (dot / len_sq) : -1;

        let xx = 0;
        let yy = 0;
        if (param < 0) {
            xx = line.p1.x;
            yy = line.p1.y;
        } else if (param > 1) {
            xx = line.p2.x;
            yy = line.p2.y;
        } else {
            xx = line.p1.x + param * C;
            yy = line.p1.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return {
            distance: Math.sqrt(Helpers.sqr(dx) + Helpers.sqr(dy)),
            x: xx,
            y: yy
        }
    },

    getNormal (segment) {
        if (!segment) return;
        if (segment.segment) segment = segment.segment;

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
    },

    getUnitVector (segment) {
        let vector = {
            x: segment.p2.x - segment.p1.x,
            y: segment.p2.y - segment.p1.y
        };

        let mag = Math.sqrt(Helpers.sqr(vector.x) + Helpers.sqr(vector.y));

        return {
            x: vector.x / mag,
            y: vector.y / mag
        };
    },

    getSegmentMiddle (segment) {
        return {
            x: segment.p1.x + ((segment.p2.x - segment.p1.x) * 0.5),
            y: segment.p1.y + ((segment.p2.y - segment.p1.y) * 0.5)
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
        if (opts.css) {
            for (let style in opts.css) {
                node.style[style] = opts.css[style];
            }
        }
        return node;
    }
};
module.exports = Helpers;
