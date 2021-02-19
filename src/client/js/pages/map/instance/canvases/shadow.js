const {
    clear
} = Lib.canvas;

const Base = require('./base');
class ShadowCanvas extends Base {
    constructor (opts = {}) {
        super('shadow', opts);

        // if (options.load_fog) {
        //     Store.fire('load_fog', {
        //         fog: options.load_fog
        //     });
        // }

        // Store.register({
        //     'load_fog': this.loadFog.bind(this),
        // }, this.map_instance.name);
    }

    get data () {
        return {};
    }

    draw () {
        // The shadow drawn on the light layer, what the players haven't seen
        clear(this.context).rect(this.context, {
            alpha: CONFIG.display.fog[CONFIG.window].hidden.opacity,
            color: CONFIG.display.fog[CONFIG.window].hidden.color
        });

        return this;
    }
}

module.exports = ShadowCanvas;



// loadFog (fog) {
//     if (!fog) return;
//     // fog data will be nested in one level if sent by Store event
//     // TODO: I need to very violently murder this code and the offending parents snippets
//     // that necessitate it's existence;
//     if (fog.fog) fog = fog.fog;

//     if (!CONFIG.is_player_screen) {
//         Store.fire('enable_light');
//     }

//     this.drawShadow();

//     let light_context_data = this.light_context.getImageData(
//         0,
//         0,
//         this.map_image_width,
//         this.map_image_height
//     );

//     fog.forEach((row, index) => {
//         row.forEach((blank_span) => {
//             let s = blank_span[0];
//             let e = blank_span[1];
//             let gid_index = ((index * light_context_data.width) * 4) + (s * 4);
//             for (let i = s; i < e; ++i) {
//                 light_context_data.data[gid_index + 0] = 0;
//                 light_context_data.data[gid_index + 1] = 0;
//                 light_context_data.data[gid_index + 2] = 0;
//                 light_context_data.data[gid_index + 3] = 0;
//                 gid_index += 4;
//             }
//         });
//     });

//     this.light_context.putImageData(light_context_data, 0, 0);
// }

// getFog () {
//     if (!this.parent.lighting_enabled) return null;

//     let light_context = this.light_context;
//     let pixel_data = light_context.getImageData(
//         0,
//         0,
//         this.map_image_width,
//         this.map_image_height
//     );
//     let pixels = pixel_data.data || [];
//     let transformed_pixel_data = [[]];
//     let row_index = 0;
//     for (let i = 0; i < pixels.length; ++i) {
//         transformed_pixel_data[row_index].push({
//             r: pixels[i + 0],
//             g: pixels[i + 1],
//             b: pixels[i + 2],
//             a: pixels[i + 3]
//         });
//         i += 3;
//         if ((((i + 1) / (pixel_data.width * 4)) % 1) === 0) {
//             transformed_pixel_data.push([]);
//             row_index += 1;
//         }
//     }

//     let state_pixel_data = [];
//     transformed_pixel_data.forEach((pixel_row) => {
//         let blank_data = [];
//         // The start and end index of blank pixels
//         let start = null;
//         pixel_row.forEach((pixel, index) => {
//             const blank = isBlankPixel(pixel);
//             // A blank pixel was encountered and we have nothing started
//             if (blank && !start) {
//                 start = index;
//             }
//             // We encountered a non blank pixel and there was a start, indicating
//             // the end of the blank "row"
//             if (!blank && start) {
//                 blank_data.push([start, index - 1]);
//                 start = null; // Reset the start after ending the blank "row"
//             }
//             if (!pixel_row[index + 1] && start) {
//                 blank_data.push([start, index]);
//             }
//         });
//         state_pixel_data.push(blank_data);
//     });

//     return state_pixel_data;
// }