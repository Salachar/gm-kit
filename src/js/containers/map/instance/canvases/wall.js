const { copyPoint } = require('../../../../lib/helpers');
const { clear, line } = require('../../../../lib/canvas');

const Base = require('./base');
class WallCanvas extends Base {
    constructor (opts = {}) {
        super('wall', opts);

        // Initialize to false for display window, true otherwise
        this.draw_walls = !CONFIG.is_player_screen;

        Store.register({
            'draw_walls': this.draw.bind(this),
        }, this.map_instance.name);
    }

    toggleWalls () {
        if (!this.map_instance.lighting_enabled) {
            Toast.message('Walls can only be toggled when light is enabled');
            return;
        }
        this.draw_walls = !this.draw_walls;
        if (this.draw_walls) {
            this.drawWallLines();
        } else {
            clear(this.wall_context);
        }
    }

    draw () {
        clear(this.context);
        if (!this.draw_walls) return this;
        this.drawSegments(this.context);
        return this;
    }

    drawSegments (context) {
        this.map_instance.managers.segment.segments.forEach((segment) => {
            const conf = CONFIG.display[segment.type || 'wall'];
            // Doors that are ajar will have temp points
            line(context, {
                points: [
                    (segment.temp_p1) ? copyPoint(segment.temp_p1) : copyPoint(segment.p1),
                    (segment.temp_p2) ? copyPoint(segment.temp_p2) : copyPoint(segment.p2)
                ],
                strokes: [{
                    color: conf.inner_color,
                    width: conf.inner_width
                }, {
                    color: conf.outer_color,
                    width: conf.outer_width
                }],
                lineCap: 'round'
            });

            this.manager.drawOneWayArrow({
                context: context, 
                segment: segment
            });
        });
    }
}

module.exports = WallCanvas;