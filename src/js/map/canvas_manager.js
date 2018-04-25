const createElement = require('../helpers').createElement;
const rgba = require('../helpers').rgba;

class CanvasManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

        // Initialize to false for display window, true otherwise
        this.draw_walls = !DISPLAY_WINDOW;

        this.createCanvasElements(map);
        this.setCanvasMouseEvents();
        this.loadImage();

        this.map_image = null;
        this.map_image_width = CONFIG.window_width;
        this.map_image_height = CONFIG.window_height;
    }

    createCanvasElements (map) {
        this.canvas_container = createElement('div', map.name + '_map canvas_container', {
            addTo: document.getElementById('map_container')
        });

        this.control_canvas = createElement('canvas', 'control_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.control_context = this.control_canvas.getContext('2d');

        this.image_canvas = createElement('canvas', 'map_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.image_context = this.image_canvas.getContext('2d');

        this.wall_canvas = createElement('canvas', 'wall_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.wall_context = this.wall_canvas.getContext('2d');

        this.light_canvas = createElement('canvas', 'light_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.light_context = this.light_canvas.getContext('2d');

        this.lights_canvas = createElement('canvas', 'lights_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.lights_context = this.lights_canvas.getContext('2d');

        this.shadow_canvas = createElement('canvas', 'shadow_canvas map_canvas', {
            addTo: this.canvas_container
        });
        this.shadow_context = this.shadow_canvas.getContext('2d');
    }

    scrollLeft () {
        // We don't want to scroll the main window if ALT is pressed
        if (KEY_DOWN[KEYS.ALT] && !DISPLAY_WINDOW) return;
        this.canvas_container.scrollLeft = this.canvas_container.scrollLeft - CONFIG.scroll_speed;
    }

    scrollRight () {
        // We don't want to scroll the main window if ALT is pressed
        if (KEY_DOWN[KEYS.ALT] && !DISPLAY_WINDOW) return;
        this.canvas_container.scrollLeft = this.canvas_container.scrollLeft + CONFIG.scroll_speed;
    }

    scrollUp () {
        // We don't want to scroll the main window if ALT is pressed
        if (KEY_DOWN[KEYS.ALT] && !DISPLAY_WINDOW) return;
        this.canvas_container.scrollTop = this.canvas_container.scrollTop - CONFIG.scroll_speed;
    }

    scrollDown () {
        // We don't want to scroll the main window if ALT is pressed
        if (KEY_DOWN[KEYS.ALT] && !DISPLAY_WINDOW) return;
        this.canvas_container.scrollTop = this.canvas_container.scrollTop + CONFIG.scroll_speed;
    }

    setCanvasMouseEvents () {
        if (DISPLAY_WINDOW) {
            // console.log('No mouse events needed for display window');
            return;
        }

        this.control_canvas.addEventListener('mousedown', (e) => {
            // if (e.which == 3) return;
            Mouse.downEvent(e);
            this.parent.mouseDown();
        });

        this.control_canvas.addEventListener('mouseup', (e) => {
            // if (e.which == 3) return;
            Mouse.upEvent(e);
            this.parent.mouseUp();
            Mouse.clearMouse(e);
        });

        this.control_canvas.addEventListener('mousemove', (e) => {
            var rect = this.control_canvas.getBoundingClientRect();
            let pos = {
                x: (e.clientX / this.parent.zoom) - rect.left,
                y: (e.clientY / this.parent.zoom) - rect.top
            };
            Mouse.moveEvent(e, pos);
            this.parent.mouseMove();
            // fireEvent('mouse_move',
        });
    }

    loadImage () {
        if (!this.map.image) return;
        let img = new Image;
        img.onload = () => {
            this.map_image_width = img.naturalWidth;
            this.map_image_height = img.naturalHeight;

            // this.draw_walls = true;
            this.resizeCanvases();

            fireEvent('image_loaded', {
                width: this.map_image_width,
                height: this.map_image_height
            });

            this.drawMap(img);
            this.drawWallLines();

            this.canvas_container.scrollLeft = 0;
            this.canvas_container.scrollTop = 0;
        }
        img.src = this.map.image;
    }

    clearFogOfWar () {
        this.shadow_context.clearRect(0, 0, this.map_image_width, this.map_image_height);
    }

    drawFogOfWar () {
        this.clearFogOfWar();
        this.shadow_context.save();
            if (DISPLAY_WINDOW) {
                this.shadow_context.globalAlpha = CONFIG.display.fog.display.seen.opacity;
            } else {
                this.shadow_context.globalAlpha = CONFIG.display.fog.control.seen.opacity;
            }

            this.shadow_context.beginPath();
            this.shadow_context.rect(0, 0, this.map_image_width, this.map_image_height);

            if (DISPLAY_WINDOW) {
                this.shadow_context.fillStyle = CONFIG.display.fog.display.seen.color;
            } else {
                this.shadow_context.fillStyle = CONFIG.display.fog.control.seen.color;
            }
            this.shadow_context.fill();
        this.shadow_context.restore();
    }

    clearLight () {
        this.light_context.clearRect(0, 0, this.map_image_width, this.map_image_height);
    }

    drawShadow () {
        // Fill the canvas with shadow
        this.clearLight();
        this.light_context.save();
            if (DISPLAY_WINDOW) {
                this.light_context.globalAlpha = CONFIG.display.fog.display.hidden.opacity;
            } else {
                this.light_context.globalAlpha = CONFIG.display.fog.control.hidden.opacity;
            }

            this.light_context.beginPath();
            this.light_context.rect(0, 0, this.map_image_width, this.map_image_height);

            if (DISPLAY_WINDOW) {
                this.light_context.fillStyle = CONFIG.display.fog.display.hidden.color;
            } else {
                this.light_context.fillStyle = CONFIG.display.fog.control.hidden.color;
            }
            this.light_context.fill();
        this.light_context.restore();
    }

    clearWallLines () {
        this.wall_context.clearRect(0, 0, this.wall_canvas.width, this.wall_canvas.height);
    }

    clearControlContext () {
        this.control_context.clearRect(0, 0, this.wall_canvas.width, this.wall_canvas.height);
    }

    drawPlacements () {
        const context = this.control_context;

        this.clearControlContext();
        if (this.parent.lighting_enabled) {
            this.drawAjarDoors(context);
            return;
        }

        context.save();
            context.lineCap = 'round';
            this.drawLinkBeingPlaced(context);
            this.drawWallBeingPlaced(context);
            this.drawSnapIndicator(context);
        context.restore();
    }

    drawWallLines () {
        const context = this.wall_context;

        this.clearWallLines();
        if (!this.draw_walls) return;

        context.save();
            this.drawLightLinks(context);
            context.lineCap = 'round';
            this.drawWalls(context);
            this.drawDoors(context);
        context.restore();
    }

    drawAjarDoors (context) {
        const doors = this.parent.SegmentManager.doors;
        context.save();
            var door = null;
            context.lineCap = 'square';
            for (var i = 0; i < doors.length; ++i) {
                door = doors[i];
                if (!door.temp_p1x && !door.temp_p2x) continue;
                context.beginPath();
                context.moveTo(door.temp_p1x || door.p1x, door.temp_p1y || door.p1y);
                context.lineTo(door.temp_p2x || door.p2x, door.temp_p2y || door.p2y);
                this.canvasStroke(context, '#000000', 8);
                this.canvasStroke(context, '#FFFFFF', 4);
            }
        context.restore();
    }

    drawLinkBeingPlaced (context) {
        if (this.parent.LinkManager.first.x && this.parent.LinkManager.first.y) {
            this.canvasCircle(context, this.parent.LinkManager.first.x, this.parent.LinkManager.first.y, 30, '#FF0000');
        }
    }

    drawLightLinks (context) {
        const links = this.parent.LinkManager.links;
        let link = null;
        for (let i = 0; i < links.length; ++i) {
            link = links[i];
            let color = rgba(120, 120, 200, 0.5);
            this.canvasCircle(context, link.first.x, link.first.y, 30, color);
            this.canvasCircle(context, link.second.x, link.second.y, 30, color);
            context.beginPath();
            context.moveTo(link.first.x, link.first.y);
            context.lineTo(link.second.x, link.second.y);
            this.canvasStroke(context, color, 6);
        }
    }

    drawWalls (context) {
        const walls = this.parent.SegmentManager.walls;
        let wall = null;
        for (var i = 0; i < walls.length; ++i) {
            wall = walls[i];
            context.beginPath();
            context.moveTo(wall.p1x, wall.p1y);
            context.lineTo(wall.p2x, wall.p2y);
            this.canvasStroke(context, CONFIG.display.wall.outer_color, CONFIG.display.wall.outer_width);
            this.canvasStroke(context, CONFIG.display.wall.inner_color, CONFIG.display.wall.inner_width);
        }
    }

    drawDoors (context) {
        const doors = this.parent.SegmentManager.doors;
        let door = null;
        for (var i = 0; i < doors.length; ++i) {
            door = doors[i];
            context.beginPath();
            context.moveTo(door.temp_p1x || door.p1x, door.temp_p1y || door.p1y);
            context.lineTo(door.temp_p2x || door.p2x, door.temp_p2y || door.p2y);
            this.canvasStroke(context, CONFIG.display.door.outer_color, CONFIG.display.door.outer_width);
            this.canvasStroke(context, CONFIG.display.door.inner_color, CONFIG.display.door.inner_width);
        }
    }

    drawWallBeingPlaced (context) {
        if (!CONFIG.lighting_enabled) {
            if (Mouse.down && !CONFIG.quick_place) {
                context.beginPath();
                context.moveTo(this.parent.SegmentManager.new_wall.start.x, this.parent.SegmentManager.new_wall.start.y);
                context.lineTo(Mouse.x, Mouse.y);
                this.canvasStroke(context, CONFIG.display.wall.place_color, CONFIG.display.wall.outer_width);
            }
            if (CONFIG.quick_place) {
                context.beginPath();
                context.moveTo(Mouse.upX, Mouse.upY);
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
                    CONFIG.snap.indicator.x,
                    CONFIG.snap.indicator.y,
                    CONFIG.snap.distance,
                    CONFIG.snap.color
                );
            }
        context.restore();
    }

    drawMap (img) {
        this.image_context.drawImage(img, 0, 0, this.map_image_width, this.map_image_height);
    }

    drawLight (opts) {
        opts = opts || {};
        window.requestAnimationFrame(() => {
            // if (!this.parent.lighting_enabled) return;
            const light_polys = opts.polys || this.parent.LightManager.getAllLightPolygons(opts);
            if (!this.parent.lighting_enabled) return;
            // Refresh the Fog of War Canvas (full transparent gray after this)
            this.drawFogOfWar();
            // Cut the lights out of the shadow context, shadow context only
            // has these current lights cut out, since the canvas was just refreshed
            this.drawLightPolygons(this.shadow_context, light_polys);
            // The light context has not been refreshed, so cutting the lights out here
            // will continue to cut out of the full opaque canvas created on light enable
            this.drawLightPolygons(this.light_context, light_polys);
            // The light objects themselves are now drawn so I know where the fuck they are
            this.drawLights();
        });
    }

    drawLights () {
        if (DISPLAY_WINDOW) return;
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
        for (var i = 0; i < polys.length; ++i) {
            var points = polys[i].intersects;
            // moveTo creates a new path, so it will not be connected to the other polys
            context.moveTo(points[0].x, points[0].y);
            for (var k = 1; k < points.length; ++k) {
                context.lineTo(points[k].x, points[k].y);
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
        this.clearLight();
        this.clearFogOfWar();
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
            this.clearWallLines();
        }
    }

    resizeCanvas (canvas) {
        $(canvas).attr('width', this.map_image_width);
        $(canvas).attr('height', this.map_image_height);
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
