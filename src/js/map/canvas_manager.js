const createElement = require('../helpers').createElement;
const rgba = require('../helpers').rgba;
const getNormal = require('../helpers').getNormal;

const Store = require('../store');

const MAX_MAP_SIZE = 3000;

class CanvasManager {
    constructor (map = {}, parent) {
        this.map = map;
        this.parent = parent;

        // Initialize to false for display window, true otherwise
        this.draw_walls = !CONFIG.is_display;

        this.createCanvasElements(map);
        this.setCanvasMouseEvents();
        this.loadImage();

        this.map_image = null;
        this.map_image_width = CONFIG.window_width;
        this.map_image_height = CONFIG.window_height;

        Store.register({
            'move_segment_toggled': this.onMoveSegmentToggled.bind(this),
            'create_one_way_wall_toggled' : this.onCreateOneWayWallToggled.bind(this),
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
            'move_point_ended': this.refreshPlacements.bind(this),
        }, parent.name);
    }

    onMoveSegmentToggled () {
        this.drawPlacements();
        this.drawWallLines();
    }

    onCreateOneWayWallToggled () {
        this.drawPlacements();
        this.drawWallLines();
    }

    onLightPolyUpdate (data) {
        if (CONFIG.is_display) {
            this.drawLight({
                force_update: true,
                polys: data
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
            console.log(e);
            this.checkScroll(e);
        });
        this.checkScroll();
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
            Store.fire('hide_scroller', {
                scroller: 'left'
            });
        } else {
            Store.fire('show_scroller' ,{
                scroller: 'left'
            });
        }

        if (left + width >= this.map_image_width) {
            Store.fire('hide_scroller', {
                scroller: 'right'
            });
        } else {
            Store.fire('show_scroller' ,{
                scroller: 'right'
            });
        }

        if (top <= 0) {
            Store.fire('hide_scroller', {
                scroller: 'top'
            });
        } else {
            Store.fire('show_scroller' ,{
                scroller: 'top'
            });
        }

        if (top + height >= this.map_image_height) {
            Store.fire('hide_scroller', {
                scroller: 'bottom'
            });
        } else {
            Store.fire('show_scroller' ,{
                scroller: 'bottom'
            });
        }
    }

    setCanvasMouseEvents () {
        if (CONFIG.is_display) return;

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
        });
    }

    loadImage () {
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
        }
        img.src = this.map.image;
    }

    clearFogOfWar () {
        this.shadow_context.clearRect(0, 0, this.map_image_width, this.map_image_height);
    }

    drawFogOfWar () {
        this.clearFogOfWar();
        this.shadow_context.save();
            this.shadow_context.globalAlpha = CONFIG.display.fog[CONFIG.window].seen.opacity;
            this.shadow_context.beginPath();
            this.shadow_context.rect(0, 0, this.map_image_width, this.map_image_height);
            this.shadow_context.fillStyle = CONFIG.display.fog[CONFIG.window].seen.color;
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
            this.light_context.globalAlpha = CONFIG.display.fog[CONFIG.window].hidden.opacity;
            this.light_context.beginPath();
            this.light_context.rect(0, 0, this.map_image_width, this.map_image_height);
            this.light_context.fillStyle = CONFIG.display.fog[CONFIG.window].hidden.color;
            this.light_context.fill();
        this.light_context.restore();
    }

    clearWallLines () {
        this.wall_context.clearRect(0, 0, this.wall_canvas.width, this.wall_canvas.height);
    }

    clearControlContext () {
        this.control_context.clearRect(0, 0, this.wall_canvas.width, this.wall_canvas.height);
    }

    drawPlacements (point) {
        const context = this.control_context;

        this.clearControlContext();
        if (this.parent.lighting_enabled) {
            this.drawAjarDoors(context);
            return;
        }

        context.save();
            context.lineCap = 'round';
            this.drawOneWayPoint (context);
            this.drawWallBeingPlaced(context);
            this.drawSnapIndicator(context);
            this.drawWallEndIndicator(context);
        context.restore();
    }

    drawWallLines () {
        const context = this.wall_context;

        this.clearWallLines();
        if (!this.draw_walls) return;

        context.save();
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

    drawWalls (context) {
        const walls = this.parent.SegmentManager.walls;

        let closest_wall = null;
        if (CONFIG.create_one_way_wall) {
            closest_wall = this.parent.ObjectManager.findClosest('wall');
        }

        let wall = null;
        for (var i = 0; i < walls.length; ++i) {
            wall = walls[i];
            context.beginPath();
            context.moveTo(wall.p1x, wall.p1y);
            context.lineTo(wall.p2x, wall.p2y);

            if (closest_wall && closest_wall.index === i) {
                this.canvasStroke(context, CONFIG.display.wall.highlight_outer_color, CONFIG.display.wall.highlight_outer_width);
                this.canvasStroke(context, CONFIG.display.wall.highlight_inner_color, CONFIG.display.wall.highlight_inner_width);
            } else {
                this.canvasStroke(context, CONFIG.display.wall.outer_color, CONFIG.display.wall.outer_width);
                this.canvasStroke(context, CONFIG.display.wall.inner_color, CONFIG.display.wall.inner_width);
            }

            if (wall.one_way) {
                this.canvasCircle(
                    context,
                    wall.one_way.open.x,
                    wall.one_way.open.y,
                    CONFIG.display.wall.outer_width,
                    CONFIG.display.wall.outer_color
                );
                this.canvasCircle(
                    context,
                    wall.one_way.open.x,
                    wall.one_way.open.y,
                    CONFIG.display.wall.inner_width,
                    CONFIG.display.wall.inner_color
                );
            }
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
                    CONFIG.snap.indicator.x,
                    CONFIG.snap.indicator.y,
                    CONFIG.snap.distance,
                    CONFIG.snap.color
                );
            }
        context.restore();
    }

    drawWallEndIndicator (context) {
        if (!CONFIG.move_segment) return;
        const wall_end = this.parent.SegmentManager.findClosestWallEnd();
        if (!wall_end) return;
        context.save();
            context.globalAlpha = 0.4;
            this.canvasCircle(
                context,
                wall_end.x,
                wall_end.y,
                CONFIG.move_point_dist,
                CONFIG.snap.color
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
