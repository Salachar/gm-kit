const {
  copy,
  getUnitVector,
  getPerpendicularUnitVector
} = Lib.helpers;

const {
  line
} = Lib.canvas;

const GridCanvas = require('../canvases/grid');
const ShroudCanvas = require('../canvases/shroud');
const ShadowCanvas = require('../canvases/shadow');
const ImageCanvas = require('../canvases/image');
const SpellCanvas = require('../canvases/spell');
const LightsCanvas = require('../canvases/lights');
const WallCanvas = require('../canvases/wall');
const ControlCanvas = require('../canvases/control');

const Base = require('./base');
class CanvasManager extends Base{
  constructor (opts = {}) {
    super(opts);

    this.canvas_container = this.map_instance.node;

    const canvas_opts = {
      map_data: this.map_data,
      map_instance: this.map_instance,
      manager: this
    };

    this.canvases = {
      grid: new GridCanvas(canvas_opts),
      shroud: new ShroudCanvas(canvas_opts),
      shadow: new ShadowCanvas(canvas_opts),
      image: new ImageCanvas(canvas_opts),
      spell: new SpellCanvas(canvas_opts),
      lights: new LightsCanvas(canvas_opts),
      wall: new WallCanvas(canvas_opts),
      control: new ControlCanvas(canvas_opts),
    };

    this.canvases.image.load().then(() => {
      this.resizeCanvases();

      Store.fire('image_loaded_(ps)', {
        image_dimensions: {
          width: this.canvases.image.width,
          height: this.canvases.image.height
        }
      });

      this.canvases.image.draw().updateBrightness();
      this.canvases.wall.draw();
      this.canvases.grid.draw();

      this.canvas_container.scrollLeft = 0;
      this.canvas_container.scrollTop = 0;
    });

    Store.register({
      'door_activated': this.onDoorActivated.bind(this),

      'enable_light': this.enableLight.bind(this),
      'disable_light': this.disableLight.bind(this),

      'move_mode_toggled': this.refreshPlacements.bind(this),
      'create_one_way_wall_toggled' : this.refreshPlacements.bind(this),
      'move_point_ended': this.refreshPlacements.bind(this),
      'remove_point': this.refreshPlacements.bind(this),

      'light_poly_update_(PS)': this.onLightPolyUpdate.bind(this),
      "show_entire_map_(PS)": this.showEntireMapPC.bind(this),
      "hide_entire_map_(PS)": this.hideEntireMapPC.bind(this),

      'animated_map_volume_change': this.onAnimatedMapVolumeChange.bind(this),
      'sight_limit': this.onSightLimit.bind(this),
    }, this.map_instance.name);
  }

  onSightLimit (data) {
    this.drawLight({
      force_update: true
    });
  }

  onAnimatedMapVolumeChange (data) {
    this.canvases.image.setVolume(data.animated_map_volume);
  }

  mute () {
    this.canvases.image.mute();
  }

  unmute () {
    this.canvases.image.unmute();
  }

  onLightPolyUpdate (data) {
    this.drawLight({
      force_update: true,
      polys: data.polys
    });
  }

  onDoorActivated () {
    this.canvases.control.draw();
    this.drawLight({
      force_update: true
    });
  }

  refreshPlacements () {
    this.canvases.control.draw();
    this.canvases.wall.draw();
  }

  drawOneWayArrow (opts = {}) {
    let { context, segment, placing } = opts;

    // placing determines whether we're drawing a placed one way wall
    // or one in preview, yet to be placed, which requires a little data handling
    if (placing && segment.segment) {
      const segment_copy = copy(segment);
      segment = copy(segment.segment);
      segment.one_way = segment_copy.points;
    }

    if (!segment || !segment.one_way) return;

    const uv = getUnitVector({
      p1: segment.one_way.open,
      p2: segment.one_way.closed
    });
    const puv = getPerpendicularUnitVector({
      p1: segment.one_way.open,
      p2: segment.one_way.closed
    });
    const arrow_start = {
      x: segment.one_way.open.x + (uv.x * 10),
      y: segment.one_way.open.y + (uv.y * 10)
    }
    const side_one = {
      x: arrow_start.x + (puv.x * 5),
      y: arrow_start.y + (puv.y * 5)
    };
    const side_two = {
      x: arrow_start.x - (puv.x * 5),
      y: arrow_start.y - (puv.y * 5)
    };

    const conf = CONFIG.display[segment.type || 'wall'];
    const conf_key_prepend = (placing) ? 'highlight_' : '';

    line(context, {
      points: [
        segment.one_way.closed, // The tail of the arrow
        arrow_start,
        side_one,
        segment.one_way.open, // The tip of the arrow
        side_two,
        arrow_start
      ],
      strokes: [{
        color: conf[conf_key_prepend + 'inner_color'],
        width: conf[conf_key_prepend + 'inner_width']
      }, {
        color: conf[conf_key_prepend + 'outer_color'],
        width: conf[conf_key_prepend + 'outer_width']
      }],
      lineCap: 'round'
    });
  }

  drawLight (opts = {}) {
    window.requestAnimationFrame(() => {
      // The light objects themselves are now drawn so I know where the fuck they are
      this.canvases.lights.draw();

      // Getting all the light polys even if we aren't going to draw them, as the
      // display window uses these light polys
      const light_polys = opts.polys || this.map_instance.managers.light.getAllLightPolygons(opts);
      if (!Store.get('lighting_enabled')) return;

      // Refresh the Fog of War Canvas (full transparent gray after this)
      // The fog has to be redrawn otherwise previous areas would be completely lit up
      this.canvases.shroud.draw();

      // Cut the lights out of the shroud context (just refreshed) so we can
      // see all the way through to what is currently lit up
      // this.drawLightPolygons(this.canvases.shroud.context, light_polys);
      this.drawLightPolygons(this.canvases.shroud.context, light_polys, 'bright_intersects');

      // The light context has not been refreshed, so cutting the lights out here
      // will continue to cut out of the full opaque canvas created on light enable
      // this.drawLightPolygons(this.canvases.shadow.context, light_polys);
      this.drawLightPolygons(this.canvases.shadow.context, light_polys, 'dim_intersects');
    });
  }

  drawLightPolygons (context, polys, poly_key = 'intersects') {
    if (!polys.length) return;
    for (let polys_i = 0; polys_i < polys.length; ++polys_i) {
      try {
        line(context, {
          points: polys[polys_i][poly_key],
          cutout: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    // Draw new content over old content (default). This is just resetting the
    // composite operation for good measure.
    context.globalCompositeOperation = "source-over";
  }

  showEntireMapPC () {
    if (!CONFIG.is_player_screen) return;
    this.disableLight();
  }

  hideEntireMapPC () {
    if (!CONFIG.is_player_screen) return;
    this.enableLight();
  }

  enableLight () {
    Store.set({lighting_enabled: true});
    Store.fire('prepare_segments');
    this.canvases.shroud.show();
    this.canvases.shadow.show().draw();
    this.drawLight();
  }

  disableLight () {
    Store.set({lighting_enabled: false});
    this.canvases.shadow.clear().hide();
    this.canvases.shroud.clear().hide();
  }

  resizeCanvases () {
    const width = this.canvases.image.width;
    const height = this.canvases.image.height;
    for (let c in this.canvases) {
      this.canvases[c].resize(width, height);
    }
  }
};
module.exports = CanvasManager;
