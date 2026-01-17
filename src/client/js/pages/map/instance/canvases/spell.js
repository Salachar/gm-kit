const {
  copyPoint,
} = Lib.helpers;

const {
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

    this.spell_marker = {
      origin: null,
      angle: 0,
    };
    this.angle_increase = 0.01;
    this.angle_timer = null;

    this.new_spell = null;

    // A current list of the spells for drawing
    this.spells = [];

    Store.register({
      'place_spell_marker': this.placeSpellMarker.bind(this),
      'draw_spell_marker': this.drawSpellMarker.bind(this),
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
          width: grid.size || 100,
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
    // const grid = Store.get('grid');
    const spell = opts.spell || {};
    // const { shape, size } = spell;

    const shape = Store.get('spell_marker_shape');
    const size = 400; // Store.get('spell_marker_size');

    // if (!shape || !size || !grid.show) return;
    if (!shape) return;

    this.new_spell = {
      shape,
      size, //  (size / 5) * grid.size,
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
    // this.drawAffectedSquares();
  }

  drawPlaced (clear_context) {
    if (clear_context) clear(this.context);
    this.drawSpells();
  }
}

module.exports = SpellCanvas;
