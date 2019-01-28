const Store = require('../store');

const {
    createElement,
    rgba,
    getNormal,
    isBlankPixel
} = require('../helpers');

const MAX_MAP_SIZE = 3000;

class CanvasManager {
    constructor (map = {}, parent, options = {}) {
        this.map = map;

        this.parent = parent;

        // Initialize to false for display window, true otherwise
        this.draw_walls = !CONFIG.is_display;

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
    }

    onLightPolyUpdate (data) {
        if (CONFIG.is_display) {
            this.drawLight({
                force_update: true,
                polys: data.polys
            });
        }
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
        this.canvas_container = createElement('div', map.name + '_map canvas_container', {
            addTo: document.getElementById('map_container')
        });

        ['control', 'image', 'wall', 'light', 'lights', 'shadow'].forEach((canvas_type) => {
            let canvas_name = canvas_type + '_canvas';
            this[canvas_name] = createElement('canvas', `${canvas_name} map_canvas`, {
                addTo: this.canvas_container
            });
            this[canvas_type + '_context'] = this[canvas_name].getContext('2d');
        });

        this.canvas_container.addEventListener('scroll', (e) => {
            this.checkScroll(e);
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

    checkScroll (e) {
        const left = Math.ceil(this.canvas_container.scrollLeft);
        const top = Math.ceil(this.canvas_container.scrollTop);
        const width = this.canvas_container.clientWidth;
        const height = this.canvas_container.clientHeight;

        if (left <= 0) {
            Store.fire('hide_scroller', { scroller: 'left' });
        } else {
            Store.fire('show_scroller', { scroller: 'left' });
        }

        if (left + width >= this.map_image_width) {
            Store.fire('hide_scroller', { scroller: 'right' });
        } else {
            Store.fire('show_scroller', { scroller: 'right' });
        }

        if (top <= 0) {
            Store.fire('hide_scroller', { scroller: 'up' });
        } else {
            Store.fire('show_scroller', { scroller: 'up' });
        }

        if (top + height >= this.map_image_height) {
            Store.fire('hide_scroller', { scroller: 'down' });
        } else {
            Store.fire('show_scroller', { scroller: 'down' });
        }
    }

    setCanvasMouseEvents () {
        if (CONFIG.is_display) return;

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
    }

    loadImage (options) {
        if (!this.map.image) return;

        let img = new Image;
        img.onload = () => {
            const natural_width = img.naturalWidth;
            const natural_height = img.naturalHeight;
            this.map_image_width = natural_width;
            this.map_image_height = natural_height;
            if (natural_width > MAX_MAP_SIZE || natural_height > MAX_MAP_SIZE) {
                const ratio = img.naturalWidth / img.naturalHeight;
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

            this.checkScroll();

            if (options.load_fog) {
                Store.fire('load_fog', {
                    fog: options.load_fog
                });
            }
        }
        if (CONFIG.window === 'control') {
            img.src = this.map.dm_image || this.map.image;
        } else {
            img.src = this.map.image || this.map.dm_image;
        }
    }

    loadFog (fog) {
        if (!fog) return;
        // fog data will be nested in one level if sent by Store event
        if (fog.fog) fog = fog.fog;

        if (!CONFIG.is_display) {
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

    clearContext (context) {
        context.clearRect(0, 0, this.map_image_width, this.map_image_height);
    }

    drawFogOfWar () { // The shadowed area that has been seen by the players
        this.clearContext(this.shadow_context);
        this.shadow_context.save();
            this.shadow_context.globalAlpha = CONFIG.display.fog[CONFIG.window].seen.opacity;
            this.shadow_context.beginPath();
            this.shadow_context.rect(0, 0, this.map_image_width, this.map_image_height);
            this.shadow_context.fillStyle = CONFIG.display.fog[CONFIG.window].seen.color;
            this.shadow_context.fill();
        this.shadow_context.restore();
    }

    drawShadow () { // The shadow drawn on the light layer, what the players haven't seen
        this.clearContext(this.light_context);
        this.light_context.save();
            this.light_context.globalAlpha = CONFIG.display.fog[CONFIG.window].hidden.opacity;
            this.light_context.beginPath();
            this.light_context.rect(0, 0, this.map_image_width, this.map_image_height);
            this.light_context.fillStyle = CONFIG.display.fog[CONFIG.window].hidden.color;
            this.light_context.fill();
        this.light_context.restore();
    }

    clearControlContext () {
        this.control_context.clearRect(0, 0, this.wall_canvas.width, this.wall_canvas.height);
    }

    drawPlacements (point) {
        const context = this.control_context;

        this.clearContext(this.control_context);
        if (this.parent.lighting_enabled || CONFIG.is_display) {
            this.drawAjarDoors(context);
            return;
        }

        context.save();
            context.lineCap = 'round';
            this.drawOneWayPoint (context);
            this.drawSegmentBeingPlaced(context);
            this.drawSnapIndicator(context);
            this.drawWallEndIndicator(context);
        context.restore();
    }

    drawWallLines () {
        const context = this.wall_context;

        this.clearContext(this.wall_context);
        if (!this.draw_walls) return;

        context.save();
            context.lineCap = 'round';
            this.drawSegments(context);
        context.restore();
    }

    drawAjarDoors (context) {
        const segments = this.parent.SegmentManager.segments;
        context.save();
            context.lineCap = 'square';
            segments.forEach((segment) => {
                if (!segment.temp_p1 && !segment.temp_p2) return;
                context.beginPath();
                const x1 = segment.temp_p1 ? segment.temp_p1.x : segment.p1.x;
                const y1 = segment.temp_p1 ? segment.temp_p1.y : segment.p1.y;
                const x2 = segment.temp_p2 ? segment.temp_p2.x : segment.p2.x;
                const y2 = segment.temp_p2 ? segment.temp_p2.y : segment.p2.y;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                this.canvasStroke(context, '#000000', 8);
                this.canvasStroke(context, '#FFFFFF', 4);
            });
        context.restore();
    }

    drawOneWayPoint (context) {
        if (!CONFIG.create_one_way_wall || !this.parent.one_way_wall.points) return;
        context.save();
            this.canvasCircle(
                context,
                this.parent.one_way_wall.points.open.x,
                this.parent.one_way_wall.points.open.y,
                CONFIG.display.wall.highlight_outer_width,
                CONFIG.display.wall.highlight_outer_color
            );
        context.restore();
    }

    drawSegments (context) {
        let closest_segment = (CONFIG.create_one_way_wall) ? this.parent.ObjectManager.findClosest('segment') : null;

        this.parent.SegmentManager.segments.forEach((segment, index) => {
            let p1 = {
                x: segment.p1.x,
                y: segment.p1.y
            };
            let p2 = {
                x: segment.p2.x,
                y: segment.p2.y
            };
            let inner_color = CONFIG.display[segment.type || 'wall'].inner_color;
            let outer_color = CONFIG.display[segment.type || 'wall'].outer_color;
            let inner_width = CONFIG.display[segment.type || 'wall'].inner_width;
            let outer_width = CONFIG.display[segment.type || 'wall'].outer_width;

            if (segment.type === 'door') {
                p1.x = segment.temp_p1 ? segment.temp_p1.x : segment.p1.x;
                p1.y = segment.temp_p1 ? segment.temp_p1.y : segment.p1.y;
                p2.x = segment.temp_p2 ? segment.temp_p2.x : segment.p2.x;
                p2.y = segment.temp_p2 ? segment.temp_p2.y : segment.p2.y;
            } else if (closest_segment && closest_segment.index === index) {
                inner_color = CONFIG.display.wall.highlight_inner_color;
                outer_color = CONFIG.display.wall.highlight_outer_color;
                inner_width = CONFIG.display.wall.highlight_inner_width;
                outer_width = CONFIG.display.wall.highlight_outer_width;
            }

            context.beginPath();
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
            this.canvasStroke(context, outer_color, outer_width);
            this.canvasStroke(context, inner_color, inner_width);

            if (segment.one_way) {
                this.canvasCircle(
                    context,
                    segment.one_way.open.x,
                    segment.one_way.open.y,
                    CONFIG.display.wall.outer_width,
                    CONFIG.display.wall.outer_color
                );
                this.canvasCircle(
                    context,
                    segment.one_way.open.x,
                    segment.one_way.open.y,
                    CONFIG.display.wall.inner_width,
                    CONFIG.display.wall.inner_color
                );
            }
        });

    }

    drawSegmentBeingPlaced (context) {
        if (!CONFIG.lighting_enabled && !CONFIG.create_one_way_wall && !CONFIG.move_segment) {
            if (Mouse.down && !CONFIG.quick_place && this.parent.SegmentManager.new_wall) {
                context.beginPath();
                context.moveTo(this.parent.SegmentManager.new_wall.x, this.parent.SegmentManager.new_wall.y);
                context.lineTo(Mouse.x, Mouse.y);
                this.canvasStroke(context, CONFIG.display.wall.place_color, CONFIG.display.wall.outer_width);
            }
            if (CONFIG.quick_place) {
                if (!this.parent.last_quickplace_coord.x) return;
                context.beginPath();
                context.moveTo(this.parent.last_quickplace_coord.x, this.parent.last_quickplace_coord.y);
                context.lineTo(Mouse.x, Mouse.y);
                this.canvasStroke(context, CONFIG.display.wall.place_color, CONFIG.display.wall.outer_width);
            }
        }
    }

    drawSnapIndicator (context) {
        if (!CONFIG.snap.indicator.show) return;
        context.save();
            context.globalAlpha = 0.4;
            if (CONFIG.snap.indicator.show) {
                this.canvasCircle(
                    context,
                    CONFIG.snap.indicator.point.x,
                    CONFIG.snap.indicator.point.y,
                    CONFIG.snap.distance,
                    CONFIG.snap.color
                );
            }
        context.restore();
    }

    drawWallEndIndicator (context) {
        if (!CONFIG.move_segment) return;
        const point_highlight = this.parent.SegmentManager.getControlPoint();
        if (!point_highlight) return;
        const color = (point_highlight.end) ? '#0000FF' : CONFIG.snap.color;
        context.save();
            context.globalAlpha = 0.4;
            this.canvasCircle(
                context,
                point_highlight.point.x,
                point_highlight.point.y,
                CONFIG.move_point_dist,
                color
            );
        context.restore();
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
        if (CONFIG.is_display) return;
        const context = this.lights_context;
        const lights = this.parent.LightManager.lights;

        context.clearRect(0, 0, this.map_image_width, this.map_image_height);

        for (let l in lights) {
            context.beginPath();
            context.arc(
                lights[l].x,
                lights[l].y,
                this.parent.LightManager.light_width,
                0,
                Math.PI * 2
            );
            context.save();
                context.globalAlpha = 0.5;
                context.fillStyle = '#FFFF99';
                context.fill();
                context.strokeStyle = '#FFFF99';
                context.stroke();
            context.restore();
        }
    }

    drawLightPolygons (context, polys) {
        // Draw all of the light polygons
        context.beginPath();
        for (let polys_i = 0; polys_i < polys.length; ++polys_i) {
            const points = polys[polys_i].intersects;
            // moveTo creates a new path, so it will not be connected to the other polys
            context.moveTo(points[0].x, points[0].y);
            for (let points_i = 0; points_i < points.length; ++points_i) {
                context.lineTo(points[points_i].x, points[points_i].y);
            }
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
        this.clearContext(this.light_context);
        this.clearContext(this.shadow_context);
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
            this.clearContext(this.wall_context);
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

    canvasCircle (context, x, y, width, color) {
        context.beginPath();
        context.arc(
            x,
            y,
            width,
            0,
            Math.PI * 2
        );
        context.fillStyle = color;
        context.fill();
        context.strokeStyle = color;
        context.stroke();
    }
};
module.exports = CanvasManager;
