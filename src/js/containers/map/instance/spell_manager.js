const {
    copyPoint,
    getAngleBetweenVectors
} = require('../../../lib/helpers');

const {
    pixelData,
    size,
    clear,
    line,
    circle,
    cone,
    rect
} = require('../../../lib/canvas');

class SpellManager {
    constructor (opts = {}) {
        this.map_instance = opts.map_instance;
        this.context = opts.context;
        this.parent = opts.parent;

        // The alpha for all of the drawn spell markers
        this.alpha = 0.25;

        this.spell_marker = {
            origin: null,
            angle: null
        };

        // A current list of the spells for drawing
        this.spells = [];

        this.shapes = {
            'line': 'cell',
            'square': 'cell',
            'circle': 'intersect',
            'cone': 'intersect'
        };

        Store.register({
            'draw_spell_marker': this.drawSpellMarker.bind(this)
        }, this.map_instance.name);
    }

    get grid () {
        return this.parent.grid;
    }

    addSpell (spell) {
        this.spells.push(spell);
        this.drawSpells();
    }

    removeSpell () {

    }

    drawSpells () {
        // Draws all completed spells
        this.spells.forEach((spell) => {
            this.drawSpell(spell);
        });
    }

    drawSpell (spell) {
        switch (spell.shape) {
            case 'line':
                rect(this.context, {
                    point: spell.origin,
                    width: this.grid.size,
                    height: spell.size,
                    color: spell.color,
                    angle: spell.angle,
                    alpha: this.alpha,
                });
                break;

            case 'square':
                rect(this.context, {
                    point: spell.origin,
                    width: spell.size,
                    color: spell.color,
                    angle: spell.angle,
                    alpha: this.alpha,
                });
                break;

            case 'circle':
                circle(this.context, {
                    point: spell.origin,
                    radius: spell.size,
                    color: spell.color,
                    alpha: this.alpha
                });
                break;

            case 'cone':
                cone(this.context, {
                    point: spell.origin,
                    length: spell.size,
                    color: spell.color,
                    angle: spell.angle,
                    alpha: this.alpha
                });
                break;

            default:
                console.error('Unsupported spell shape: ' + spell.shape);
                break;
        }

        this.findAffectedSquares();
    }

    updateMarkerInfo () {
        let origin = copyPoint(Mouse);
        let angle = null;

        if (Mouse.down) {
            origin = {
                x: Mouse.downX,
                y: Mouse.downY
            };
            const v1 = {
                x: 1,
                y: 0
            };
            const v2 = {
                x: Mouse.x - Mouse.downX,
                y: Mouse.y - Mouse.downY
            }
            angle = getAngleBetweenVectors(v1, v2);
            if (v2.y < v1.y) angle *= -1;
        }

        this.spell_marker.origin = origin;
        this.spell_marker.angle = angle || this.spell_marker.angle || null;
    }

    drawSpellMarker (opts = {}) {
        const spell = opts.spell || {};
        const { shape, size } = spell;
        if (!shape || !size || !this.grid.show) return;

        let new_spell = {
            shape: spell.shape,
            size: (size / 5) * this.grid.size,
            origin: null,
            angle: this.spell_marker.angle,
            color: '#FF0000'
        };

        // "final" means that we want to keep everything as is and put
        // the spell into the list without updates/modifications
        if (!spell.final) {
            this.updateMarkerInfo();
        }

        new_spell.origin = this.spell_marker.origin;

        // TODO: Either refine or remove grid snapping.
        // The DM will know how to line it up how they want and I shouldnt force their hand
        // if (this.shapes[shape] === 'intersect') {
        //     new_spell.origin = this.getClosestIntersect(this.spell_marker.origin);
        // } else if (this.shapes[shape] === 'cell') {
        //     new_spell.origin = this.getClosestCell(this.spell_marker.origin);
        // }

        if (!new_spell.origin) return;

        if (spell.final) {
            return this.addSpell(new_spell);
        }

        clear(this.context);
        this.drawSpell(new_spell);
        this.drawSpells();
    }

    getClosestCell (point) {
        point = point || copyPoint(Mouse);

        // Normalize the point and grid by offsetting the point the same as the grid
        point.x -= this.grid.offset.x;
        point.y -= this.grid.offset.y;

        const floor_x = Math.floor(point.x / this.grid.size);
        const floor_y = Math.floor(point.y / this.grid.size);

        // returns the point in the middle of the cell
        return {
            x: (floor_x * this.grid.size) + this.grid.offset.x,
            y: (floor_y * this.grid.size) + this.grid.offset.y
        };
    }

    getClosestIntersect (point) {
        point = point || copyPoint(Mouse);

        // Normalize the point and grid by offsetting the point the same as the grid
        point.x -= this.grid.offset.x;
        point.y -= this.grid.offset.y;

        const floor_x = Math.floor(point.x / this.grid.size);
        const floor_y = Math.floor(point.y / this.grid.size);

        // The coordinates of the top/left cell the mouse is in
        // but not necessarily the closest corner of the cell
        const base_x = floor_x * this.grid.size;
        const base_y = floor_y * this.grid.size;

        let final_x = base_x;
        let final_y = base_y;

        const half_grid_size = this.grid.size / 2;
        if ((point.x - base_x) > half_grid_size) {
            final_x = base_x + this.grid.size;
        }
        if ((point.y - base_y) > half_grid_size) {
            final_y = base_y + this.grid.size;
        }

        return {
            x: final_x + this.grid.offset.x,
            y: final_y + this.grid.offset.y
        };
    }

    findAffectedSquares () {
        const { width, height } = size(this.context);
        const pixel_data = pixelData(this.context);

        const half_grid_size = this.grid.size / 2;
        for (let y = this.grid.offset.y; y < (height - this.grid.offset.y); y+= this.grid.size) {
            let cell_y = y + half_grid_size;
            let row_data = pixel_data[cell_y];
            if (!row_data) continue;

            for (let x = this.grid.offset.x; x < (width - this.grid.offset.x); x += this.grid.size) {
                let cell_x = x + half_grid_size;
                let cell_data = row_data[cell_x];

                if (!cell_data.blank) {
                    rect(this.context, {
                        point: {
                            x: cell_x,
                            y: cell_y
                        },
                        width: this.grid.size,
                        color: '#0000FF',
                        alpha: this.alpha,
                    });
                }
            }
        }
    }
}

module.exports = SpellManager;