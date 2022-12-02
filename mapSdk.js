MapSdk = {
    init() {
        if (this.mapOverlay.mapHandler._spawnSector) {
            //exists already, don't recreate
        } else {
            //doesn't exist yet
            this.mapOverlay.mapHandler._spawnSector = this.mapOverlay.mapHandler.spawnSector;
        }
        this.mapOverlay.mapHandler.spawnSector = (data, sector) => {
            this.mapOverlay.mapHandler._spawnSector(data, sector);
            // Main map canvas
            var beginX = sector.x - data.x;
            var endX = beginX + this.mapOverlay.mapSubSectorSize;
            var beginY = sector.y - data.y;
            var endY = beginY + this.mapOverlay.mapSubSectorSize;
            for (var x in data.tiles) {
                var x = parseInt(x, 10);
                if (x < beginX || x >= endX) {
                    continue;
                }
                for (var y in data.tiles[x]) {
                    var y = parseInt(y, 10);
                    if (y < beginY || y >= endY) {
                        continue;
                    }
                    // comment is if you don't want to draw anything in sectors where there are no villages to reduce drawing calls.
                    // var v = this.mapOverlay.villages[(data.x + x) * 1000 + (data.y + y)];
                    // if (v) {
                    var el = $('#mapOverlay_canvas_' + sector.x + '_' + sector.y);
                    if (!el.length) {
                        var canvas = document.createElement('canvas');
                        canvas.style.position = 'absolute';
                        canvas.width = (this.mapOverlay.map.scale[0] * this.mapOverlay.map.sectorSize);
                        canvas.height = (this.mapOverlay.map.scale[1] * this.mapOverlay.map.sectorSize);
                        canvas.style.zIndex = 10;
                        canvas.className = 'mapOverlay_map_canvas';
                        canvas.id = 'mapOverlay_canvas_' + sector.x + '_' + sector.y;
                        sector.appendElement(canvas, 0, 0);

                        // draw here
                        this.redrawSector(sector, canvas);
                    }
                    // }
                }
            }

            // Topo canvas
            for (var key in this.mapOverlay.minimap._loadedSectors) {
                var sector = this.mapOverlay.minimap._loadedSectors[key];
                var el = $('#mapOverlay_topo_canvas_' + key);
                if (!el.length) {
                    var canvas = document.createElement('canvas');
                    canvas.style.position = 'absolute';
                    canvas.width = '250';
                    canvas.height = '250';
                    canvas.style.zIndex = 11;
                    canvas.className = 'mapOverlay_topo_canvas';
                    canvas.id = 'mapOverlay_topo_canvas_' + key;
                    sector.appendElement(canvas, 0, 0);

                    this.redrawMiniSector(sector, canvas);
                }
            }

        }

        this.mapOverlay.reload();
        return "Initialised map sdk";
    },
    circleVillage(x, y, size, styling, sector, canvas) {
        //main map
        let ctx = canvas.getContext('2d');
        let pos = this.pixelByCoord(sector, x, y);
        // only draw in sectors where the circle ends up to limit draws
        if (this.circleInSector(pos[0], pos[1], size * TWMap.map.scale[0], size * TWMap.map.scale[1], canvas.width, canvas.height)) {
            ctx.beginPath();
            // add styling
            if (styling.strokeStyle) ctx.strokeStyle = styling.strokeStyle;
            if (styling.lineWidth) ctx.lineWidth = styling.lineWidth;
            if (styling.fillStyle) ctx.fillStyle = styling.fillStyle;
            ctx.ellipse(pos[0], pos[1], size * TWMap.map.scale[0], size * TWMap.map.scale[1], 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    },
    circleMiniVillage(x, y, size, styling, sector, canvas) {
        let ctx = canvas.getContext('2d');
        x = (x - sector.x) * 5 + 3;
        y = (y - sector.y) * 5 + 3;
        ctx.beginPath();
        // add styling
        if (styling.strokeStyle) ctx.strokeStyle = styling.strokeStyle;
        if (styling.lineWidth) ctx.lineWidth = styling.lineWidth;
        if (styling.fillStyle) ctx.fillStyle = styling.fillStyle;
        ctx.arc(x, y, size * 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    },
    line(x1, y1, x2, y2) {
        // TODO: rewrite this to use object.
        let ctx = canvas.getContext('2d');
        let origin = this.pixelByCoord(element[1], x1, y1);
        let target = this.pixelByCoord(element[1], x2, y2);
        console.log(origin, target);
        // only draw in sectors where the line is in
        ctx.beginPath();
        if (styling.strokeStyle) ctx.strokeStyle = styling.strokeStyle;
        if (styling.lineWidth) ctx.lineWidth = styling.lineWidth;
        if (styling.fillStyle) ctx.fillStyle = styling.fillStyle;
        ctx.moveTo(origin[0], origin[1]);
        ctx.lineTo(target[0], target[0]);
        ctx.stroke();
        ctx.closePath();
    },
    iconOnMap(img, x, y, size) {
        // TODO: rewrite this to use object.
        ctx = this.canvas.getContext("2d");
        ctx.drawImage(img, x - (size / 2), y - (size / 2), size, size);
    },
    textOnMap(text, x, y, color, font) {
        // TODO: rewrite this to use object.
        ctx = this.canvas.getContext("2d");
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.miterLimit = 1;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
    },
    pixelByCoord(sector, x, y) {
        st_pixel = this.mapOverlay.map.pixelByCoord(sector.x, sector.y);
        originXY = this.mapOverlay.map.pixelByCoord(x, y);
        originX = (originXY[0] - st_pixel[0]) + this.mapOverlay.tileSize[0] / 2;
        originY = (originXY[1] - st_pixel[1]) + this.mapOverlay.tileSize[1] / 2;
        return [originX, originY];
    },
    clearMap() {
        // TODO: clear all objects

        // reload the overlay once cleared
        this.mapOverlay.reload();
    },
    circleInSector(cx, cy, radiusX, radiusY, sw, sh) {
        // TODO: check correctly, we don't have a real circle but an ellipse...
        let testX = cx;
        let testY = cy;

        if (cx < 0) testX = 0; // left
        else if (cx > sw) testX = sw; // right
        if (cy < 0) testY = 0; // top
        else if (cy > sh) testY = sh; // bottom

        let distX = cx - testX;
        let distY = cy - testY;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        if (distance <= radiusX) {
            return true;
        }
        return false;
    },
    redrawSector(sector, canvas) {
        this.circles.forEach(element => {
            this.circleVillage(element.x, element.y, element.radius, element.styling, sector, canvas);
        });
    },
    redrawMiniSector(sector, canvas) {
        this.circles.forEach(element => {
            this.circleMiniVillage(element.x, element.y, element.radius, element.styling, sector, canvas);
        });
    },
    circles: [{
        x: 556,
        y: 347,
        radius: 5,
        styling: { "strokeStyle": "red", "lineWidth": 5, "fillStyle": "rgba(255, 255, 255, 0.5)" }
    }],
    lines: [],
    texts: [],
    icons: [],
    mapOverlay: TWMap,
};