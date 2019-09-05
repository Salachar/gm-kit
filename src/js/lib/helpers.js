const {
    createElement,
    configureElement,
    cacheElements
} = require('./dom');

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

        if (line.position) {
            return {
                distance: Math.sqrt(Helpers.sqr(line.position.x - point.x) + Helpers.sqr(line.position.y - point.y)),
                x: line.position.x,
                y: line.position.y
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

    getNormal: function (segment, reference_point) {
        reference_point = reference_point || Mouse;
        // the "open" normal will be on the side
        // of the reference point, the mouse in most cases
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
            x: Math.round(middle_point.x + mod_vector.x),
            y: Math.round(middle_point.y + mod_vector.y)
        };

        let point_two = {
            x: Math.round(middle_point.x - mod_vector.x),
            y: Math.round(middle_point.y - mod_vector.y)
        };

        let dist_one = Helpers.pDistance(reference_point, point_one);
        let dist_two = Helpers.pDistance(reference_point, point_two);

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

    getSlope: function (p1, p2) {
        return (p2.y - p1.y) / (p2.x - p1.x);
    },

    getUnitVector: function (segment) {
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

    getPerpendicularUnitVector: function (segment) {
        let unit_vector = Helpers.getUnitVector(segment);
        let perp = {
            x: unit_vector.y,
            y: unit_vector.x * -1
        }
        return perp;
    },

    getSegmentMiddle: function (segment) {
        return {
            x: segment.p1.x + ((segment.p2.x - segment.p1.x) * 0.5),
            y: segment.p1.y + ((segment.p2.y - segment.p1.y) * 0.5)
        };
    },

    cacheElements: function (obj, cache_list) {
        cacheElements(obj, cache_list)
    },

    createElement: function (type, classes, opts = {}) {
        return createElement(type, classes, opts);
    },

    configureElement: function (node, opts = {}) {
        return configureElement(node, opts);
    },

    HSVtoRGB: function (hsv) {
        let h = hsv.h;
        let s = hsv.s;
        let v = hsv.v;

        let r, g, b, i, f, p, q, t;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;

            case 1:
                r = q, g = v, b = p;
                break;

            case 2:
                r = p, g = v, b = t;
                break;

            case 3:
                r = p, g = q, b = v;
                break;

            case 4:
                r = t, g = p, b = v;
                break;

            case 5:
                r = v, g = p, b = q;
                break;
        }

        r = Math.floor(r * 255);
        g = Math.floor(g * 255);
        b = Math.floor(b * 255);

        return {
            r: r,
            g: g,
            b: b,
            string: `rgb(${r}, ${g}, ${b})`
        };
    },

    // HSVtoRGB: function ($iH, $iS, $iV) {
    // HSVtoRGB: function (hsv) {
    //     let $iH = hsv.h;
    //     let $iS = hsv.s;
    //     let $iV = hsv.v;

    //     if($iH < 0)   $iH = 0;   // Hue:
    //     if($iH > 360) $iH = 360; //   0-360
    //     if($iS < 0)   $iS = 0;   // Saturation:
    //     if($iS > 100) $iS = 100; //   0-100
    //     if($iV < 0)   $iV = 0;   // Lightness:
    //     if($iV > 100) $iV = 100; //   0-100

    //     let $dS = $iS/100.0; // Saturation: 0.0-1.0
    //     let $dV = $iV/100.0; // Lightness:  0.0-1.0
    //     let $dC = $dV*$dS;   // Chroma:     0.0-1.0
    //     let $dH = $iH/60.0;  // H-Prime:    0.0-6.0
    //     let $dT = $dH;       // Temp variable

    //     while($dT >= 2.0) $dT -= 2.0;
    //     let $dX = $dC*(1-Math.abs($dT-1));

    //       let $dR, $dG, $dB;

    //     switch(Math.floor($dH)) {
    //         case 0:
    //             $dR = $dC; $dG = $dX; $dB = 0.0; break;
    //         case 1:
    //             $dR = $dX; $dG = $dC; $dB = 0.0; break;
    //         case 2:
    //             $dR = 0.0; $dG = $dC; $dB = $dX; break;
    //         case 3:
    //             $dR = 0.0; $dG = $dX; $dB = $dC; break;
    //         case 4:
    //             $dR = $dX; $dG = 0.0; $dB = $dC; break;
    //         case 5:
    //             $dR = $dC; $dG = 0.0; $dB = $dX; break;
    //         default:
    //             $dR = 0.0; $dG = 0.0; $dB = 0.0; break;
    //     }

    //     let $dM  = $dV - $dC;
    //     $dR += $dM; $dG += $dM; $dB += $dM;
    //     $dR *= 255; $dG *= 255; $dB *= 255;

    //     // This would return RGB
    //     // return Math.round($dR)+","+Math.round($dG)+","+Math.round($dB);

    //     return {
    //         r: $dR,
    //         g: $dG,
    //         b: $dB,
    //         string: Math.round($dR) + "," + Math.round($dG) + "," + Math.round($dB)
    //     };

    //     // This would return html HEX
    //     //$color = dechex( ($dR << 16) + ($dG << 8) + $dB );
    //     //return '#' . str_repeat('0', 6 - strlen($color)) . $color;

    // }
};

module.exports = Helpers;