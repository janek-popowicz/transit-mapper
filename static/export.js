import { visualizeMap } from './draw.js';

function exportToFormat(mapData, format, area_coords) {
    if (format === 'png') {
        if (!area_coords || !Array.isArray(area_coords)) return;
        
        // Destrukturyzacja tablicy koordynatów
        const [x1, y1, x2, y2] = area_coords;
        
        const scaleFactor = 4;
        const width = Math.abs(x2 - x1) * 50 * scaleFactor;
        const height = Math.abs(y2 - y1) * 50 * scaleFactor;

        // Tworzymy dwa canvas'y - jeden dla tła, drugi dla mapy
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = width;
        backgroundCanvas.height = height;
        const bgCtx = backgroundCanvas.getContext('2d');

        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapCtx = mapCanvas.getContext('2d');

        // Rysujemy białe tło
        bgCtx.fillStyle = '#FFFFFF';
        bgCtx.fillRect(0, 0, width, height);

        // Rysujemy mapę z transformacjami
        mapCtx.save();
        mapCtx.scale(scaleFactor, scaleFactor);

        const centerX = -(x1 + x2) * 25;
        const centerY = (y1 + y2) * 25;

        visualizeMap(
            mapData,
            mapCtx,
            {width: width/scaleFactor, height: height/scaleFactor},
            centerX,
            centerY,
            1,
            true
        );

        mapCtx.restore();

        // Łączymy oba canvas'y
        bgCtx.drawImage(mapCanvas, 0, 0);

        // Eksportujemy połączony rezultat
        const dataUrl = backgroundCanvas.toDataURL('image/png');
        downloadFile(dataUrl, 'transit-map.png');
    }
}

function downloadFile(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}

export { exportToFormat };