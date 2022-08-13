const {
  copyPoint,
} = Lib.helpers;

const {
  pixelData,
  size,
  clear,
  circle,
  cone,
  rect,
} = Lib.canvas;

const Base = require('./base');
class SpellCanvas extends Base {
  constructor (opts = {}) {
    super('spell', opts);

    // The alpha for all of the drawn spell markers
    this.alpha = 0.25;

    this.show_affected_tiles = false;

    this.spell_marker = {
      origin: null,
      angle: 0,
    };
    this.angle_increase = 0.01;
    this.angle_timer = null;

    this.new_spell = null;

    // A current list of the spells for drawing
    this.spells = [];

    this.shapes = {
      'line': 'cell',
      'square': 'cell',
      'circle': 'intersect',
      'cone': 'intersect'
    };

    Store.register({
      'place_spell_marker': this.placeSpellMarker.bind(this),
      'draw_spell_marker': this.drawSpellMarker.bind(this),
      'show_affected_tiles_toggled': this.onShowAffectedTilesToggled.bind(this),
      // 'arrow_up_down': this.onArrowUp.bind(this),
      // 'arrow_down_down': this.onArrowDown.bind(this),
      'arrow_right_press': this.onArrowRightPress.bind(this),
      'arrow_left_press': this.onArrowLeftPress.bind(this),
      'arrow_right_release': this.onArrowRightRelease.bind(this),
      'arrow_left_release': this.onArrowLeftRelease.bind(this),

      'spell_marker_shape_updated': this.onSpellMarkerShapeUpdated.bind(this),
      // 'spell_marker_angle_updated': this.drawSpellMarker.bind(this),
    }, this.map_instance.name);
  }

  onShowAffectedTilesToggled () {
    this.drawAll(this.new_spell);
  }

  onSpellMarkerShapeUpdated () {
    if (!Store.get('spell_marker_shape')) {
      this.new_spell = null;
      this.drawAll();
    }
  }

  onArrowUp () {
    // Fire event for controls manager to listen to and change spell marker size
  }

  onArrowDown () {
    // Fire event for controls manager to listen to and change spell marker size
  }

  onArrowRightPress () {
    this.setAngleTimer(1);
  }

  onArrowLeftPress () {
    this.setAngleTimer(-1);
  }

  onArrowRightRelease () {
    this.killAngleTimer();
  }

  onArrowLeftRelease () {
    this.killAngleTimer();
  }

  setAngleTimer (mod) {
    this.angle_timer = setInterval(() => {
      this.spell_marker.angle += (this.angle_increase * mod);
      this.new_spell.angle = this.spell_marker.angle;
      Store.fire('draw_spell_marker-(ps)', {
        spell: {
          origin: copyPoint(Mouse)
        },
        'spell_marker_angle': this.spell_marker.angle
      });
      this.drawAll();
    }, 10);
  }

  killAngleTimer () {
    window.clearInterval(this.angle_timer);
    this.angle_timer = null;
  }

  addSpell (spell) {
    this.spells.push(this.new_spell);
    this.new_spell = null;
    this.drawAll();
  }

  removeSpell () {

  }

  placeSpellMarker () {
    this.addSpell();
    Store.fire('deselect_spell_marker');
  }

  drawSpells () {
    // Draws all completed spells
    this.spells.forEach((spell) => {
      this.drawSpell(spell);
    });
  }

  drawSpell (spell) {
    if (!spell) return;
    const grid = Store.get('grid');

    switch (spell.shape) {
      case 'line':
        rect(this.context, {
          point: spell.origin,
          width: grid.size,
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

    // Draw the origin point
    circle(this.context, {
      point: spell.origin,
      radius: 10,
      color: spell.color,
      alpha: this.alpha * 2
    });
  }

  drawSpellMarker (opts = {}) {
    const grid = Store.get('grid');
    const spell = opts.spell || {};
    // const { shape, size } = spell;

    const shape = Store.get('spell_marker_shape');
    const size = Store.get('spell_marker_size');

    if (!shape || !size || !grid.show) return;

    this.new_spell = {
      shape: shape,
      size: (size / 5) * grid.size,
      origin: spell.origin || copyPoint(Mouse),
      // angle: this.spell_marker.angle,
      angle: Store.get('spell_marker_angle') || 0,
      color: Store.get('spell_marker_color') || '#FF0000'
    };

    this.drawAll(this.new_spell);
  }

  drawAll (spell) {
    clear(this.context);
    this.drawSpells();
    this.drawSpell(spell || this.new_spell);
    this.drawAffectedSquares();
  }

  drawPlaced (clear_context) {
    if (clear_context) clear(this.context);
    this.drawSpells();
  }

  getClosestCell (point) {
    point = point || copyPoint(Mouse);
    const grid = Store.get('grid');

    // Normalize the point and grid by offsetting the point the same as the grid
    point.x -= grid.offset.x;
    point.y -= grid.offset.y;

    const floor_x = Math.floor(point.x / grid.size);
    const floor_y = Math.floor(point.y / grid.size);

    // returns the point in the middle of the cell
    return {
      x: (floor_x * grid.size) + grid.offset.x,
      y: (floor_y * grid.size) + grid.offset.y
    };
  }

  getClosestIntersect (point) {
    point = point || copyPoint(Mouse);
    const grid = Store.get('grid');

    // Normalize the point and grid by offsetting the point the same as the grid
    point.x -= grid.offset.x;
    point.y -= grid.offset.y;

    const floor_x = Math.floor(point.x / grid.size);
    const floor_y = Math.floor(point.y / grid.size);

    // The coordinates of the top/left cell the mouse is in
    // but not necessarily the closest corner of the cell
    const base_x = floor_x * grid.size;
    const base_y = floor_y * grid.size;

    let final_x = base_x;
    let final_y = base_y;

    const half_grid_size = grid.size / 2;
    if ((point.x - base_x) > half_grid_size) {
      final_x = base_x + grid.size;
    }
    if ((point.y - base_y) > half_grid_size) {
      final_y = base_y + grid.size;
    }

    return {
      x: final_x + grid.offset.x,
      y: final_y + grid.offset.y
    };
  }

  drawAffectedSquares () {
    if (!Store.get('show_affected_tiles')) return;
    const grid = Store.get('grid');

    const { width, height } = size(this.context);
    const pixel_data = pixelData(this.context);

    const half_grid_size = grid.size / 2;
    const y_bound = height - grid.offset.y;
    const x_bound = width - grid.offset.x;
    const grid_size = grid.size;

    for (let y = grid.offset.y; y < y_bound; y += grid_size) {
      let cell_y = Math.floor(y + half_grid_size);
      let row_data = pixel_data[cell_y];
      if (!row_data) continue;

      for (let x = grid.offset.x; x < x_bound; x += grid_size) {
        let cell_x = Math.floor(x + half_grid_size);
        let cell_data = row_data[cell_x];
        if (!cell_data) continue;

        if (!cell_data.blank) {
          const valid = this.checkSurroundingCells(pixel_data, cell_x, cell_y);
          if (!valid) continue;

          rect(this.context, {
            point: {
              x: cell_x,
              y: cell_y
            },
            width: grid_size,
            color: '#0000AA',
            alpha: this.alpha
          });
        }
      }
    }
  }

  checkSurroundingCells (pixel_data, middle_x, middle_y) {
    const grid = Store.get('grid');

    // I can adjust how far apart and how many of the additional points
    // need to be hit for a valid cell
    const amount_required = 2;
    let amount_valid = 0;
    const offset = Math.round(grid.size / 4);

    [{x: 0, y: -offset},  // top`
    {x: offset, y: 0},    // right
    {x: 0, y: offset},    // bottom
    {x: -offset, y: 0}    // left
    ].forEach((point_mod) => {
      try {
        const cell_x = middle_x + point_mod.x;
        const cell_y = middle_y + point_mod.y;
        const cell = pixel_data[cell_y][cell_x];
        if (!cell.blank) amount_valid += 1;
      } catch (e) {
        console.log(e);
      }
    });

    return amount_valid >= amount_required;
  }
}

module.exports = SpellCanvas;
