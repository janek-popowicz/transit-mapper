import { visualizeMap } from './draw.js';

function exportToFormat(mapData, format) {
    if (format === 'png') {
        // 1. Stwórz tymczasowy canvas o większej rozdzielczości
        const scaleFactor = 4; // Zwiększ rozdzielczość 4x
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = window.innerWidth * scaleFactor;
        tempCanvas.height = window.innerHeight * scaleFactor;
        const tempCtx = tempCanvas.getContext('2d');

        // 2. Wypełnij tło na biało
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 3. Dostosuj transformacje do nowej rozdzielczości
        tempCtx.save();
        tempCtx.scale(scaleFactor, scaleFactor);

        // 4. Narysuj mapę używając istniejącej funkcji
        visualizeMap(
            mapData, 
            tempCtx, 
            {
                width: window.innerWidth,
                height: window.innerHeight
            }, 
            0, 0, 1, true
        );

        tempCtx.restore();

        // 5. Eksportuj do PNG
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