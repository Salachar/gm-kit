const {
  pixelData,
  line,
} = require('../canvas');

const {
  rgb,
} = require('../helpers');

const Base = require('./base');
class ColorPicker extends Base {
  constructor (identifiers, props = {}) {
    if (typeof identifiers === 'object') {
      props = identifiers;
      identifiers = '';
    }

    super(identifiers, props);

    this.container = null;
    this.canvas = null;
    this.context = null;
    this.crosshair = null;

    this.props = {
      identifiers: identifiers || '',
      ...props,
    };

    return this.render();
  }

  render () {
    const {
      identifiers,
    } = this.props;

    /*
    ColorPicker currently cant use Lib.dom.generate
    since it wouldnt have dimensions at creation time
    so the colors couldnt be drawn correctly

    TODO: Create a separate constant sized popup?
    */

    return [`div ${identifiers} .color_picker`, {
      oncreate: (node) => {
        this.container = node;
      },
    }, [
      ['canvas .color_picker_canvas', {
        oncreate: (canvas) => {
          this.canvas = canvas;
          let context = canvas.getContext('2d');
          this.context = context;

          let pixel_index = 0;

          canvas.width = this.container.clientWidth;
          canvas.height = this.container.clientHeight;

          const fidelity = 255 / (canvas.width / 6);

          // start with red
          let r = 255;
          let g = 0;
          let b = 0;
          // increase green to 255
          for (g; g <= 255; g += fidelity) { pixel_index += 1; drawLine();}
          // reduce red to 0
          for (r; r >= 0; r -= fidelity) { pixel_index += 1; drawLine();}
          // increase blue to 255
          for (b; b <= 255; b += fidelity) { pixel_index += 1; drawLine();}
          // reduce green to 0
          for (g; g >= 0; g -= fidelity) { pixel_index += 1; drawLine();}
          // increase red to 255
          for (r; r <= 255; r += fidelity) { pixel_index += 1; drawLine();}
          // reduce blue to 0
          for (b; b >= 0; b -= fidelity) { pixel_index += 1; drawLine();}

          function drawLine () {
            line(context, {
              points: [{
                x: pixel_index,
                y: 0
              }, {
                x: pixel_index,
                y: canvas.height
              }],
              width: 1,
              color: rgb(r,g,b)
            });
          }
        },
        click: (e) => {
          const {
            store_key,
          } = this.props;

          const rect = this.canvas.getBoundingClientRect();
          const pos = {
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top),
          };

          this.crosshair.style.top = pos.y + 'px';
          this.crosshair.style.left = pos.x + 'px';

          const pixel_data = pixelData(this.context);
          const selected = pixel_data[pos.y][pos.x];
          const color = rgb(selected.r, selected.g, selected.b);

          this.handleStore({
            store_key,
          }, color);
        },
      }],
      ['div .color_picker_crosshair', {
        oncreate: (node) => {
          this.crosshair = node;
        }
      }],
    ]];
  }
}

module.exports = ColorPicker;
