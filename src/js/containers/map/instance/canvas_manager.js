const {
    copy,
    createElement,
    rgba,
    isBlankPixel,
    getUnitVector,
    getPerpendicularUnitVector,
    copyPoint
} = require('../../../lib/helpers');

const {
    clear,
    line,
    circle
} = require('../../../lib/canvas');

const MAX_MAP_SIZE = 3000;

class CanvasManager {
    constructor (map = {}, parent, options = {}) {
        this.map = map;

        this.parent = parent;

        // Initialize to false for display window, true otherwise
        this.draw_walls = !CONFIG.is_player_screen;

        this.canvas_container = parent.node;

        this.createCanvasElements(map);
        this.setCanvasMouseEvents();
        this.loadImage(options);

        this.map_image = null;
        this.map_image_width = CONFIG.window_width;
        this.map_image_height = CONFIG.window_height;

        Store.register({
            'light_poly_update': this.onLightPolyUpdate.bind(this),
            'quick_place_started': this.onQuickPlaceToggled.bind(this),
            'quick_place_ended': this.onQuickPlaceToggled.bind(this),
            'lights_cleared': this.onLightsCleared.bind(this),
            'scroll_up': this.scrollUp.bind(this),
            'scroll_right': this.scrollRight.bind(this),
            'scroll_down': this.scrollDown.bind(this),
            'scroll_left': this.scrollLeft.bind(this),
            'door_activated': this.onDoorActivated.bind(this),
            'draw_walls': this.drawWallLines.bind(this),
            'load_fog': this.loadFog.bind(this),

            'move_segment_toggled': this.refreshPlacements.bind(this),
            'create_one_way_wall_toggled' : this.refreshPlacements.bind(this),
            'move_point_ended': this.refreshPlacements.bind(this),
            'remove_point': this.refreshPlacements.bind(this),
        }, parent.name);

        window.light_context = this.light_context;
    }

    onLightPolyUpdate (data) {
        if (!CONFIG.is_player_screen) return;
        this.drawLight({
            force_update: true,
            polys: data.polys
        });
    }

    onQuickPlaceToggled () {
        this.drawPlacements();
    }

    onLightsCleared () {
        this.drawLights();
    }

    onDoorActivated () {
        this.drawPlacements();
        this.drawLight({
            force_update: true
        });
    }

    refreshPlacements () {
        this.drawPlacements();
        this.drawWallLines();
    }

    createCanvasElements (map) {
        ['control', 'image', 'wall', 'light', 'lights', 'shadow'].forEach((canvas_type) => {
            let canvas_name = canvas_type + '_canvas';
            this[canvas_name] = createElement('canvas', `${canvas_name} map_canvas`, {
                addTo: this.canvas_container
            });
            this[canvas_type + '_context'] = this[canvas_name].getContext('2d');
        });
    }

    scrollLeft () {
        this.canvas_container.scrollLeft = this.canvas_container.scrollLeft - CONFIG.scroll_speed;
    }

    scrollRight () {
        this.canvas_container.scrollLeft = this.canvas_container.scrollLeft + CONFIG.scroll_speed;
    }

    scrollUp () {
        this.canvas_container.scrollTop = this.canvas_container.scrollTop - CONFIG.scroll_speed;
    }

    scrollDown () {
        this.canvas_container.scrollTop = this.canvas_container.scrollTop + CONFIG.scroll_speed;
    }

    setCanvasMouseEvents () {
        if (CONFIG.is_player_screen) return;

        this.control_canvas.addEventListener('mousedown', (e) => {
            Mouse.downEvent(e);
            this.parent.mouseDown();
        });

        this.control_canvas.addEventListener('mouseup', (e) => {
            Mouse.upEvent(e);
            this.parent.mouseUp();
            Mouse.clearMouse(e);
        });

        this.control_canvas.addEventListener('mousemove', (e) => {
            const rect = this.control_canvas.getBoundingClientRect();
            const pos = {
                x: (e.clientX / this.parent.zoom) - rect.left,
                y: (e.clientY / this.parent.zoom) - rect.top
            };
            Mouse.moveEvent(e, pos);
            this.parent.mouseMove();
        });

        this.control_canvas.addEventListener('mouseleave', (e) => {
            Store.fire('mouse_leave');
        });
    }

    loadImage (options) {
        if (!this.map.image) return;

        let img = new Image;
        img.onload = () => {
            this.map_image_width = img.naturalWidth;
            this.map_image_height = img.naturalHeight;
            if (this.map_image_width > MAX_MAP_SIZE || this.map_image_height > MAX_MAP_SIZE) {
                const ratio = this.map_image_width / this.map_image_height;
                if (ratio > 1) {
                    // Image is wider than it is taller
                    this.map_image_width = MAX_MAP_SIZE;
                    this.map_image_height = this.map_image_width / ratio;
                } else if (ratio < 1) {
                    // Image is taller than it is wider
                    this.map_image_height = MAX_MAP_SIZE;
                    this.map_image_width = this.map_image_height * ratio;
                } else {
                    // Image is a square or something
                    this.map_image_width = MAX_MAP_SIZE;
                    this.map_image_height = MAX_MAP_SIZE;
                }
            }

            this.resizeCanvases();

            Store.fire('image_loaded', {
                image_dimensions: {
                    width: this.map_image_width,
                    height: this.map_image_height
                }
            });

            this.drawMap(img);
            this.drawWallLines();

            this.canvas_container.scrollLeft = 0;
            this.canvas_container.scrollTop = 0;

            if (options.load_fog) {
                Store.fire('load_fog', {
                    fog: options.load_fog
                });
            }
        }
        if (!CONFIG.is_player_screen) {
            img.src = this.map.dm_image || this.map.image;
        } else {
            img.src = this.map.image || this.map.dm_image;
        }
    }

    loadFog (fog) {
        if (!fog) return;
        // fog data will be nested in one level if sent by Store event
        if (fog.fog) fog = fog.fog;

        if (!CONFIG.is_player_screen) {
            Store.fire('enable_light');
        }

        this.drawShadow();

        let light_context_data = this.light_context.getImageData(
            0,
            0,
            this.map_image_width,
            this.map_image_height
        );

        fog.forEach((row, index) => {
            row.forEach((blank_span) => {
                let s = blank_span[0];
                let e = blank_span[1];
                let gid_index = ((index * light_context_data.width) * 4) + (s * 4);
                for (let i = s; i < e; ++i) {
                    light_context_data.data[gid_index + 0] = 0;
                    light_context_data.data[gid_index + 1] = 0;
                    light_context_data.data[gid_index + 2] = 0;
                    light_context_data.data[gid_index + 3] = 0;
                    gid_index += 4;
                }
            });
        });

        this.light_context.putImageData(light_context_data, 0, 0);
    }

    getFog () {
        if (!this.parent.lighting_enabled) return null;

        let light_context = this.light_context;
        let pixel_data = light_context.getImageData(
            0,
            0,
            this.map_image_width,
            this.map_image_height
        );
        let pixels = pixel_data.data || [];
        let transformed_pixel_data = [[]];
        let row_index = 0;
        for (let i = 0; i < pixels.length; ++i) {
            transformed_pixel_data[row_index].push({
                r: pixels[i + 0],
                g: pixels[i + 1],
                b: pixels[i + 2],
                a: pixels[i + 3]
            });
            i += 3;
            if ((((i + 1) / (pixel_data.width * 4)) % 1) === 0) {
                transformed_pixel_data.push([]);
                row_index += 1;
            }
        }

        let state_pixel_data = [];
        transformed_pixel_data.forEach((pixel_row) => {
            let blank_data = [];
            // The start and end index of blank pixels
            let start = null;
            pixel_row.forEach((pixel, index) => {
                const blank = isBlankPixel(pixel);
                // A blank pixel was encountered and we have nothing started
                if (blank && !start) {
                    start = index;
                }
                // We encountered a non blank pixel and there was a start, indicating
                // the end of the blank "row"
                if (!blank && start) {
                    blank_data.push([start, index - 1]);
                    start = null; // Reset the start after ending the blank "row"
                }
                if (!pixel_row[index + 1] && start) {
                    blank_data.push([start, index]);
                }
            });
            state_pixel_data.push(blank_data);
        });

        return state_pixel_data;
    }

    drawFogOfWar () {
        // The shadowed area that has been seen by the players
        clear(this.shadow_context).rect(this.shadow_context, {
            alpha: CONFIG.display.fog[CONFIG.window].seen.opacity,
            color: CONFIG.display.fog[CONFIG.window].seen.color
        });
    }

    drawShadow () {
        // The shadow drawn on the light layer, what the players haven't seen
        clear(this.light_context).rect(this.light_context, {
            alpha: CONFIG.display.fog[CONFIG.window].hidden.opacity,
            color: CONFIG.display.fog[CONFIG.window].hidden.color
        });
    }

    drawPlacements (point) {
        const context = this.control_context;

        clear(this.control_context);
        if (this.parent.lighting_enabled || CONFIG.is_player_screen) {
            this.drawAjarDoors(context);
            return;
        }

        context.save();
            context.lineCap = 'round';
            // this.drawOneWayPoint (context);
            this.drawOneWayArrow(context, this.parent.one_way_wall, true);
            this.drawSegmentBeingPlaced(context);
            this.drawSnapIndicator(context);
            this.drawWallEndIndicator(context);
        context.restore();
    }

    drawWallLines () {
        clear(this.wall_context);
        if (!this.draw_walls) return;
        this.drawSegments(this.wall_context);
    }

    drawAjarDoors (context) {
        this.parent.SegmentManager.segments.forEach((segment) => {
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

    drawSegments (context) {
        this.parent.SegmentManager.segments.forEach((segment) => {
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

            this.drawOneWayArrow(context, segment);
        });
    }

    drawOneWayArrow (context, segment, placing) {
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
            }]
        });
    }

    drawSegmentBeingPlaced (context) {
        // Exit early for non-applicable modes
        if (CONFIG.lighting_enabled || CONFIG.create_one_way_wall || CONFIG.move_segment) return;
        // Normal wall placement
        if (Mouse.down && !CONFIG.quick_place && this.parent.SegmentManager.new_wall) {
            context.beginPath();
            context.moveTo(this.parent.SegmentManager.new_wall.x, this.parent.SegmentManager.new_wall.y);
            context.lineTo(Mouse.x, Mouse.y);
            this.canvasStroke(context, CONFIG.display.wall.place_color, CONFIG.display.wall.outer_width);
        }
        // Quick place and there is a legit prev point to connect to
        if (CONFIG.quick_place && this.parent.last_quickplace_coord.x) {
            context.beginPath();
            context.moveTo(this.parent.last_quickplace_coord.x, this.parent.last_quickplace_coord.y);
            context.lineTo(Mouse.x, Mouse.y);
            this.canvasStroke(context, CONFIG.display.wall.place_color, CONFIG.display.wall.outer_width);
        }
    }

    drawSnapIndicator (context) {
        if (!CONFIG.snap.indicator.show) return;
        circle(context, {
            point:  CONFIG.snap.indicator.point,
            radius: CONFIG.snap.distance,
            color: CONFIG.snap.color,
            alpha: 0.4
        });
    }

    drawWallEndIndicator (context) {
        if (!CONFIG.move_segment) return;
        const point_highlight = this.parent.SegmentManager.getControlPoint();
        if (!point_highlight) return;
        circle(context, {
            point:  point_highlight.point,
            radius: CONFIG.move_point_dist,
            color: (point_highlight.end) ? '#0000FF' : CONFIG.snap.color,
            alpha: 0.4
        });
    }

    drawMap (img) {
        this.image_context.drawImage(img, 0, 0, this.map_image_width, this.map_image_height);
    }

    drawLight (opts = {}) {
        window.requestAnimationFrame(() => {
            // Getting all the light polys even if we aren't going to draw them, as the
            // display window uses these light polys
            const light_polys = opts.polys || this.parent.LightManager.getAllLightPolygons(opts);
            if (!this.parent.lighting_enabled) return;
            // Refresh the Fog of War Canvas (full transparent gray after this)
            // The fog has to be redrawn otherwise previous areas would be completely lit up
            this.drawFogOfWar();
            // Cut the lights out of the shadow context (just refreshed) so we can
            // see all the way through to what is currently lit up
            this.drawLightPolygons(this.shadow_context, light_polys);
            // The light context has not been refreshed, so cutting the lights out here
            // will continue to cut out of the full opaque canvas created on light enable
            this.drawLightPolygons(this.light_context, light_polys);
            // The light objects themselves are now drawn so I know where the fuck they are
            this.drawLights();
        });
    }

    drawLights () {
        if (CONFIG.is_player_screen) return;
        const context = this.lights_context;
        const lights = this.parent.LightManager.lights;
        clear(context);
        for (let l in lights) {
            circle(context, {
                point: lights[l],
                radius: this.parent.LightManager.light_width,
                color: '#FFFF99',
                alpha: 0.5
            });
        }
    }

    drawLightPolygons (context, polys) {
        // Draw all of the light polygons
        context.beginPath();
        for (let polys_i = 0; polys_i < polys.length; ++polys_i) {
            line(context, {
                points: polys[polys_i].intersects
            });
        }
        // Draw existing content inside new content. All of the current objects only
        // inside the light polygons are shown. Everything else is transparent
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = rgba(0, 255, 0, 1);
        context.fill();
        // Draw new content over old content (default). This is just resetting the
        // composite operation, which is needed for the drawing of the shadow.
        context.globalCompositeOperation = "source-over";
    }

    enableLight () {
        this.light_canvas.classList.remove('hidden');
        this.shadow_canvas.classList.remove('hidden');
        this.drawShadow();
        this.drawLight();
    }

    disableLight () {
        clear(this.light_context);
        clear(this.shadow_context);
        this.light_canvas.classList.add('hidden');
        this.shadow_canvas.classList.add('hidden');
    }

    toggleWalls () {
        if (!this.parent.lighting_enabled) {
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

    resizeCanvas (canvas) {
        canvas.setAttribute('width', this.map_image_width);
        canvas.setAttribute('height', this.map_image_height);
        canvas.style.width = this.map_image_width + 'px';
        canvas.style.height = this.map_image_height + 'px';
    }

    resizeCanvases () {
        this.resizeCanvas(this.control_canvas);
        this.resizeCanvas(this.image_canvas);
        this.resizeCanvas(this.wall_canvas);
        this.resizeCanvas(this.shadow_canvas);
        this.resizeCanvas(this.light_canvas);
        this.resizeCanvas(this.lights_canvas);
    }

    canvasStroke (context, color, width) {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.stroke();
    }
};
module.exports = CanvasManager;
