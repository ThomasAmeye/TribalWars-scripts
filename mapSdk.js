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
        return "Initialised Map SDK";
    },
    circleVillage(x, y, size, styling, sector, canvas) {
        //main map
        let ctx = canvas.getContext('2d');
        let pos = this.pixelByCoord(sector, x, y);
        // only draw in sectors where the circle ends up to limit draws
        if (this.circleInSector(pos[0], pos[1], size * TWMap.map.scale[0], size * TWMap.map.scale[1], canvas.width, canvas.height)) {
            ctx.beginPath();
            // add styling
            if (styling.main && styling.main.strokeStyle) ctx.strokeStyle = styling.main.strokeStyle;
            if (styling.main && styling.main.lineWidth) ctx.lineWidth = styling.main.lineWidth;
            if (styling.main && styling.main.fillStyle) ctx.fillStyle = styling.main.fillStyle;
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
        if (styling.mini && styling.mini.strokeStyle) ctx.strokeStyle = styling.mini.strokeStyle;
        if (styling.mini && styling.mini.lineWidth) ctx.lineWidth = styling.mini.lineWidth;
        if (styling.mini && styling.mini.fillStyle) ctx.fillStyle = styling.mini.fillStyle;
        ctx.arc(x, y, size * 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    },
    line(x1, y1, x2, y2, styling, sector, canvas) {
        let ctx = canvas.getContext('2d');
        let origin = this.pixelByCoord(sector, x1, y1);
        let target = this.pixelByCoord(sector, x2, y2);
        console.log(origin, target);
        // TODO: only draw in sectors where the line is in
        ctx.beginPath();
        if (styling.main && styling.main.strokeStyle) ctx.strokeStyle = styling.main.strokeStyle;
        if (styling.main && styling.main.lineWidth) ctx.lineWidth = styling.main.lineWidth;
        if (styling.main && styling.main.fillStyle) ctx.fillStyle = styling.fillStyle;
        ctx.moveTo(origin[0], origin[1]);
        ctx.lineTo(target[0], target[1]);
        ctx.stroke();
        ctx.closePath();
    },
    lineMini(x1, y1, x2, y2, styling, sector, canvas) {
        let ctx = canvas.getContext('2d');
        x1 = (x1 - sector.x) * 5 + 3;
        y1 = (y1 - sector.y) * 5 + 3;
        x2 = (x2 - sector.x) * 5 + 3;
        y2 = (y2 - sector.y) * 5 + 3;
        ctx.beginPath();
        if (styling.mini && styling.mini.strokeStyle) ctx.strokeStyle = styling.mini.strokeStyle;
        if (styling.mini && styling.mini.lineWidth) ctx.lineWidth = styling.mini.lineWidth;
        if (styling.mini && styling.mini.fillStyle) ctx.fillStyle = styling.mini.fillStyle;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    },
    iconOnMap(img, x, y, size, sector, canvas) {
        let ctx = canvas.getContext('2d');
        let pos = this.pixelByCoord(sector, x, y);
        // TODO: only draw in sectors where the icon is in
        ctx.drawImage(img, pos[0] - (size / 2), pos[1] - (size / 2), size, size);
    },
    iconOnMiniMap(img, x, y, size, sector, canvas) {
        let ctx = canvas.getContext('2d');
        x = (x - sector.x) * 5 + 3;
        y = (y - sector.y) * 5 + 3;
        ctx.drawImage(img, x - (size / 2), y - (size / 2), size, size);
    },
    textOnMap(text, x, y, color, font, sector, canvas) {
        // TODO: rewrite this to use object.
        ctx = canvas.getContext("2d");
        let pos = this.pixelByCoord(sector, x, y);
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.miterLimit = 1;
        ctx.strokeText(text, pos[0], pos[1]);
        ctx.fillText(text, pos[0], pos[1]);
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
        this.circles = [];
        this.lines = [];
        this.texts = [];
        this.icons = [];
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
            if (element.drawOnMap) this.circleVillage(element.x, element.y, element.radius, element.styling, sector, canvas);
        });
        this.lines.forEach(element => {
            if (element.drawOnMap) this.line(element.x1, element.y1, element.x2, element.y2, element.styling, sector, canvas);
        })
        this.icons.forEach(element => {
            if (element.drawOnMap) this.iconOnMap(element.img && element.img.src != '' ? element.img : this.defaultImg, element.x, element.y, element.mapSize || 20, sector, canvas);
        })
        this.texts.forEach(element => {
            if (element.drawOnMap) this.textOnMap(element.text, element.x, element.y, element.color || "white", element.font || "10px Arial", sector, canvas);
        })
    },
    redrawMiniSector(sector, canvas) {
        this.circles.forEach(element => {
            if (element.drawOnMini) this.circleMiniVillage(element.x, element.y, element.radius, element.styling, sector, canvas);
        });
        this.lines.forEach(element => {
            if (element.drawOnMini) this.lineMini(element.x1, element.y1, element.x2, element.y2, element.styling, sector, canvas);
        })
        this.icons.forEach(element => {
            if (element.drawOnMini) this.iconOnMiniMap(element.img && element.img.src != '' ? element.img : this.defaultImg, element.x, element.y, element.miniSize || 5, sector, canvas);
        })
    },
    circles: [
        //     {
        //     x: 556,
        //     y: 347,
        //     radius: 5,
        //     styling: {
        //         main: {
        //             "strokeStyle": "red",
        //             "lineWidth": 5,
        //             "fillStyle": "rgba(255, 255, 255, 0.5)"
        //         },
        //         mini: {
        //             "strokeStyle": "red",
        //             "lineWidth": 2,
        //             "fillStyle": "rgba(255, 255, 255, 0.5)"
        //         }
        //     },
        //     drawOnMini: true,
        //     drawOnMap: true,
        // }
    ],
    lines: [
        //     {
        //     x1: 556,
        //     y1: 347,
        //     x2: 558,
        //     y2: 343,
        //     styling: {
        //         main: {
        //             "strokeStyle": "red",
        //             "lineWidth": 5
        //         },
        //         mini: {
        //             "strokeStyle": "red",
        //             "lineWidth": 1
        //         }
        //     },
        //     drawOnMini: false,
        //     drawOnMap: true,
        // }
    ],
    texts: [
        //     {
        //     text: "Test text",
        //     x: (556 + 558) / 2, // middle of the line from the above example
        //     y: (347 + 343) / 2, // middle of the line from the above example
        //     font: "10px Arial",
        //     color: "red",
        //     drawOnMap: true,
        // }
    ],
    icons: [
        //     {
        //     img: new Image(), // REQUIRED TO SET THE SRC OF THE IMAGE WHEN ASSIGNING THIS TO THE OBJECT!
        //     x: 556,
        //     y: 347,
        //     drawOnMini: true,
        //     drawOnMap: true,
        //     mapSize: 20,
        //     miniSize: 5,
        // }
    ],
    mapOverlay: TWMap,
    defaultImg: new Image()
};
MapSdk.defaultImg.src = "/graphic/buildings/wall.png";