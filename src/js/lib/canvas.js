const {
    rgba
} = require('./helpers');

/*
    NOTE (9/4/20): this.map_image_width used to be passed in for rect size for:
        drawFogOfWar
        drawShadow
*/

// Faster copyPoint only used in this file
function fastCopy (point = {}) {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return null;
    return {
        x: point.x,
        y: point.y
    };
}

const Canvas = {
    size: function (context) {
        return {
            width: context.canvas.width || context.canvas.clientWidth || 0,
            height: context.canvas.height || context.canvas.clientHeight || 0
        };
    },

    clear: function (context, opts = {}) {
        let {
            start,
            end
        } = opts;

        if (!start) {
            start = {
                x: 0,
                y: 0
            };
        }

        if (!end) {
            const size = Canvas.size(context);
            end = {
                x: size.width,
                y: size.height,
            }
        }

        context.clearRect(start.x, start.y, end.x, end.y);
        // Clearing of the canvas will most likely be followed by an operation
        // of sorts, so return Canvas for chaining, maybe do this for the others
        // as well
        return Canvas;
    },

    line: function (context, opts = {}) {
        const {
            points,
            alpha,
            lineCap,
            fill,
            cutout
        } = opts;

        const start_point = fastCopy(points[0]);
        if (!start_point) return;

        let strokes = opts.strokes || [];
        if (opts.width && opts.color) {
            strokes.push({
                width: opts.width,
                color: opts.color
            });
        }

        context.save();
            // Options are butt(default) | round | square
            context.lineCap = lineCap || 'butt';
            context.globalAlpha = alpha || 1;
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; ++i) {
                // Invalid points returns a bad copy
                if (!fastCopy(points[i])) return;
                context.lineTo(points[i].x, points[i].y);
            }
            // Not passing strokes will just create the lines and leave it open
            // to whatever called this function, if more outside operations are desired
            if (strokes.length) {
                strokes.forEach((stroke) => {
                    Canvas.stroke(context, {
                        width: stroke.width,
                        color: stroke.color
                    });
                });
            }
            if (cutout) {
                // "destination-out" : Draw existing content inside new content. This basically
                // cuts out the drawn shape from the canvas. This will let us see through the sections
                // we cut out of the shadow and shroud layers
                context.fillStyle = rgba(0, 0, 0, 1);
                context.globalCompositeOperation = "destination-out";
                context.fill();
            }
            if (fill) {
                context.fillStyle = fill.style || rgba(0, 0, 0, 1);
                context.globalCompositeOperation = fill.composite || "source-over";
                context.fill();
            }
        context.restore();
    },

    stroke: function (context, opts = {}) {
        const {
            width,
            color
        } = opts;

        context.strokeStyle = color;
        context.lineWidth = width;
        context.stroke();
    },

    rect: function (context, opts = {}) {
        let {
            start,
            end,
            color,
            alpha
        } = opts;

        if (!start) {
            start = {
                x: 0,
                y: 0
            };
        }

        if (!end) {
            end = {
                x: context.canvas.width || context.canvas.clientWidth || 0,
                y: context.canvas.height || context.canvas.clientHeight || 0,
            }
        }

        context.save();
            context.globalAlpha = alpha || 1;
            context.beginPath();
            context.rect(start.x, start.y, end.x, end.y);
            context.fillStyle = color || '#000000';
            context.fill();
        context.restore();
    },

    arc: function (context, opts = {}) {

    },

    circle: function (context, opts = {}) {
        const {
            point,
            radius,
            color,
            alpha
        } = opts;

        context.save();
            context.globalAlpha = alpha || 1;
            context.beginPath();
            context.arc(
                point.x,
                point.y,
                radius,
                0,          // start at angle 0
                Math.PI * 2 // go to angle 2PI, making a complete circle
            );
            context.fillStyle = color;
            context.fill();
            context.strokeStyle = color;
            context.stroke();
        context.restore();
    }
};

module.exports = Canvas;
