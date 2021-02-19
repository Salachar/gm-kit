const {
    copyPoint
} = Lib.helpers;
const {
    clear,
    line,
    circle
} = Lib.canvas;

const Base = require('./base');
class ControlCanvas extends Base {
    constructor (opts = {}) {
        super('control', opts);

        this.setupMouseEvents();

        Store.register({
            'quick_place_started': this.draw.bind(this),
            'quick_place_ended': this.draw.bind(this),
            'draw_placements': this.draw.bind(this),
        }, this.map_instance.name);
    }

    setupMouseEvents () {
        if (CONFIG.is_player_screen) return;

        this.canvas.addEventListener('mousedown', (e) => {
            Mouse.downEvent(e);
            this.map_instance.mouseDown();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            Mouse.upEvent(e);
            this.map_instance.mouseUp();
            Mouse.clearMouse(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const pos = {
                x: (e.clientX / this.map_instance.zoom) - rect.left,
                y: (e.clientY / this.map_instance.zoom) - rect.top
            };
            Mouse.moveEvent(e, pos);
            this.map_instance.mouseMove();
        });

        this.canvas.addEventListener('mouseleave', (e) => {
            Store.fire('mouse_leave');
        });
    }

    draw () {
        const context = this.context;
        clear(context);
        this.drawAjarDoors();
        if (CONFIG.is_player_screen) return;

        this.manager.drawOneWayArrow({
            context: context,
            segment: this.map_instance.one_way_wall,
            placing: true
        });

        this.drawSegmentBeingPlaced();
        this.drawSnapIndicator();
        this.drawWallEndIndicator();

        return this;
    }

    drawAjarDoors () {
        const context = this.context;

        if (!Store.get('lighting_enabled'));

        this.map_instance.managers.segment.segments.forEach((segment) => {
            if (!segment.temp_p1 && !segment.temp_p2) return;
            line(context, {
                points: [
                    segment.temp_p1 ? segment.temp_p1 : segment.p1,
                    segment.temp_p2 ? segment.temp_p2 : segment.p2
                ],
                strokes: [{
                    color: '#000000',
                    width: 8
                }, {
                    color: '#FFFFFF',
                    width: 4
                }],
                lineCap: 'square',
            });
        });
    }

    drawSegmentBeingPlaced () {
        const context = this.context;

        // Exit early for non-applicable modes
        if (Store.get('lighting_enabled') || Store.get('create_one_way_wall') || CONFIG.move_mode) return;

        // Normal wall placement
        let point = copyPoint(this.map_instance.managers.segment.new_wall);
        // Quick place and there is a legit prev point to connect to
        if (CONFIG.quick_place) point = copyPoint(this.map_instance.last_quickplace_coord);
        line(context, {
            points: [point, Mouse],
            width: CONFIG.display.wall.outer_width,
            color: CONFIG.display.wall.place_color,
            lineCap: 'round'
        });
    }

    drawSnapIndicator () {
        const context = this.context;
        if (!CONFIG.snap.indicator.show) return;
        circle(context, {
            point:  CONFIG.snap.indicator.point,
            radius: CONFIG.snap.distance,
            color: CONFIG.snap.color,
            alpha: 0.4
        });
    }

    drawWallEndIndicator () {
        const context = this.context;
        if (!CONFIG.move_mode) return;
        const point_highlight = this.map_instance.managers.segment.getControlPoint();
        if (!point_highlight) return;
        circle(context, {
            point:  point_highlight.point,
            radius: CONFIG.move_point_dist,
            color: (point_highlight.end) ? '#0000FF' : CONFIG.snap.color,
            alpha: 0.4
        });
    }
}

module.exports = ControlCanvas;