import { visualizeMap } from './draw.js';

function exportToFormat(mapData, format) {
    if (format === 'png') {
        // 1. Pokaż dialog do wprowadzenia współrzędnych
        const coordinates = prompt(
            "Podaj współrzędne prostokąta do eksportu w formacie:\n" +
            "x1,y1,x2,y2\n" +
            "gdzie (x1,y1) to lewy dolny róg, a (x2,y2) to prawy górny róg",
            "-10,10,10,-10" // Domyślne wartości
        );

        if (!coordinates) return;

        // 2. Parsuj współrzędne
        const [x1, y1, x2, y2] = coordinates.split(',').map(Number);
        
        // 3. Oblicz wymiary eksportu w pikselach
        const width = Math.abs(x2 - x1) * 50;
        const height = Math.abs(y2 - y1) * 50;

        // 4. Stwórz tymczasowy canvas o odpowiednim rozmiarze
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        // 5. Wypełnij tło na biało
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, width, height);

        // 6. Oblicz przesunięcie do środka wybranego obszaru
        const centerX = -(x1 + x2) * 25;
        const centerY = (y1 + y2) * 25;

        // 7. Narysuj mapę z odpowiednim przesunięciem
        visualizeMap(
            mapData,
            tempCtx,
            {width, height},
            centerX,
            centerY,
            1,
            true // skipGrid
        );

        // 8. Eksportuj do PNG
        const dataUrl = tempCanvas.toDataURL('image/png');
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