class QuadrantManager {
  constructor () {
    this.angle_amount = 720;
    this.angle_amount_quarter = this.angle_amount / 4;
    this.angle_increment = (Math.PI * 2) / this.angle_amount;
    this.angle_lookup = [];

    this.angle_quadrants = [
      [], // TL
      [], // TR
      [], // BR
      [], // BL
    ];

    this.TL = 0;
    this.TR = 1;
    this.BR = 2;
    this.BL = 3;

    this.angle_quadrants_keys = {
      0: 'TL',
      1: 'TR',
      2: 'BR',
      3: 'BL'
    };

    this.quadrant_opposites = {
      'TL': 'BR',
      'TR': 'BL',
      'BR': 'TL',
      'BL': 'TR'
    };

    this.createAngles();
  }

  getSegments (map, light_quadrant, angle_quadrant) {
    const is_same_quadrant = light_quadrant === angle_quadrant;
    if (is_same_quadrant) {
      return map.managers.segment.quadrants[angle_quadrant];
    }

    const is_opposite_quadrant = this.quadrant_opposites[light_quadrant] === angle_quadrant;
    if (is_opposite_quadrant) {
      return map.managers.segment.allSegments();
    }

    return map.managers.segment.getQuadrantSegments([light_quadrant, angle_quadrant]);
  }

  getQuadrant (map, point) {
    const x_bound = map.managers.segment.bounds.width / 2;
    const y_bound = map.managers.segment.bounds.height / 2;

    if (point.x <= x_bound && point.y <= y_bound) {
      return 'TL';
    }
    if (point.x >= x_bound && point.y <= y_bound) {
      return 'TR';
    }
    if (point.x >= x_bound && point.y >= y_bound) {
      return 'BR';
    }
    if (point.x <= x_bound && point.y >= y_bound) {
      return 'BL';
    }
  }

  isOppositeQuadrant (quadrant_1, quadrant_2) {
    return this.quadrant_opposites[quadrant_1] === quadrant_2;
  }

  createAngleQuadrants () {
    for (let i = 0; i <= this.angle_lookup.length; ++i) {
      if (!this.angle_lookup[i]) continue;
      if (i >= this.angle_amount_quarter * 0 && i <= this.angle_amount_quarter * 1) {
        this.angle_quadrants[this.BR].push(this.angle_lookup[i]);
      }
      if (i >= this.angle_amount_quarter * 1 && i <= this.angle_amount_quarter * 2) {
        this.angle_quadrants[this.BL].push(this.angle_lookup[i]);
      }
      if (i >= this.angle_amount_quarter * 2 && i <= this.angle_amount_quarter * 3) {
        this.angle_quadrants[this.TL].push(this.angle_lookup[i]);
      }
      if (i >= this.angle_amount_quarter * 3 && i <= this.angle_amount_quarter * 4) {
        this.angle_quadrants[this.TR].push(this.angle_lookup[i]);
      }
    }
  }

  polishAngles () {
    for (let i = 0; i < this.angle_lookup.length; ++i) {
      let angle = this.angle_lookup[i];
      if (angle.x < 0.000001 && angle.x > -0.000001) {
        angle.x = 0;
      }
      if (angle.x > 0.999999 && angle.x < 1.000001) {
        angle.x = 1;
      }
      if (angle.x < -0.999999 && angle.x > -1.000001) {
        angle.x = -1;
      }
      if (angle.y < 0.000001 && angle.y > -0.000001) {
        angle.y = 0;
      }
      if (angle.y > 0.999999 && angle.y < 1.000001) {
        angle.y = 1;
      }
      if (angle.y < -0.999999 && angle.y > -1.000001) {
        angle.y = -1;
      }
    }
    this.createAngleQuadrants();
  }

  createAngles () {
    for (let i = 0; i < this.angle_amount; ++i) {
      let angle = i * this.angle_increment;
      let vecX = Math.cos(angle);
      let vecY = Math.sin(angle);
      this.angle_lookup.push({
        x : vecX,
        y : vecY,
      });
    }
    this.polishAngles();
  }
};
module.exports = QuadrantManager;
