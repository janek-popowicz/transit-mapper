import { visualizeMap } from './draw.js';
import { pointToSegmentDistance } from './clickHandlers.js';
import { getMapCoordinatesFromClick } from './clickHandlers.js';
import { showEditMenu } from './editMenu.js';
import { generateLineList } from './lineMenu.js';
import { uploadMap, downloadMap, loadInitialMapData, uploadIcon } from './importexport.js';
import { exportToFormat } from './export.js';

export let mapData = null; // Eksportuj mapData

export function setMapData(newData) {
    mapData = newData; // Funkcja do aktualizacji mapData
}

// Inicjalizacja canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

// Dopasowanie rozmiaru canvas do okna przeglądarki
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Funkcja do pobierania danych mapy z backendu
export async function fetchMapData() {
   // console.log("Fetched map data:", mapData); // Loguj dane mapy
    visualizeMap(mapData, ctx, canvas, offsetX, offsetY, scale); // Przekazanie przesunięcia i skali
    generateLineList(mapData, applyChanges, fetchMapData, showEditMenu); // Generowanie menu linii
}

// Przesuwanie mapy
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let offsetX = 0; // Przesunięcie mapy w osi X
let offsetY = 0; // Przesunięcie mapy w osi Y
let scale = 1; // Początkowa skala mapy

// Debounce do fetchMapData
let fetchTimeout = null;
function debounceFetchMapData() {
    if (fetchTimeout) clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(fetchMapData, 5); // 30 ms po ostatnim ruchu
}

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = "grabbing"; // Zmień kursor na "grabbing"
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        offsetX += dx;
        offsetY += dy;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        debounceFetchMapData();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "default";
    fetchMapData();
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "default";
});

// Obsługa zoomu (scroll myszki)
canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Zapobiegaj domyślnemu przewijaniu strony

    const zoomIntensity = 0.1; // Intensywność zoomu
    const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity; // Powiększanie lub pomniejszanie

    // Przelicz współrzędne kursora na współrzędne mapy
    const mouseX = (e.clientX - canvas.width / 2) / scale - offsetX / scale;
    const mouseY = (e.clientY - canvas.height / 2) / scale - offsetY / scale;

    // Aktualizacja skali
    scale *= zoom;

    // Dostosuj przesunięcie, aby zoom był względem kursora
    offsetX = -(mouseX * scale - (e.clientX - canvas.width / 2));
    offsetY = -(mouseY * scale - (e.clientY - canvas.height / 2));

    fetchMapData(); // Ponowne rysowanie mapy z nową skalą
});

// Funkcja do obsługi zoomu
function applyZoom(zoomFactor) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Przelicz współrzędne środka canvas na współrzędne mapy
    const mapX = (centerX - offsetX) / scale;
    const mapY = (centerY - offsetY) / scale;

    // Aktualizacja skali
    scale *= zoomFactor;

    // Dostosuj przesunięcie, aby zoom był względem środka canvas
    offsetX = centerX - mapX * scale;
    offsetY = centerY - mapY * scale;

    fetchMapData(); // Ponowne rysowanie mapy z nową skalą
}



// Nasłuchiwanie zdarzenia zmiany rozmiaru okna
window.addEventListener("resize", () => {
    resizeCanvas();
    fetchMapData(); // Odśwież mapę po zmianie rozmiaru okna
});

// Ustaw początkowy rozmiar canvas
resizeCanvas();
loadInitialMapData(fetchMapData); // Załaduj mapę na start

canvas.style.cursor = "default";







// Sprawdzanie kliknięć w obiekty na mapie
canvas.addEventListener("click", (e) => {

    if (isDragging || isDrawingSegment || isPlacingNode || isDrawingRiver) return;
    if (!mapData) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    // console.log(`Kliknięcie w: (${mapX.toFixed(2)}, ${mapY.toFixed(2)})`);
   // console.log(mapX, mapY);
   
    const clickedNode = mapData.nodes.find(node => {
        const [x, y] = node.coordinates;
        const radius = (node.size / 100);

        // Sprawdź, czy kliknięcie znajduje się w zakresie współrzędnych node'a
        const isWithinBounds = 
            mapX >= x - radius && mapX <= x + radius &&
            mapY >= y - radius && mapY <= y + radius;

        if (!isWithinBounds) return false;

        // Sprawdź, czy kliknięcie znajduje się w kole o promieniu 0.4
        const distance = Math.hypot(mapX - x, mapY - y);
        // console.log(distance, radius);
        return distance <= radius;
    });

    if (clickedNode) {
        showEditMenu("node", clickedNode, applyChanges, fetchMapData, mapData);
        console.log("Kliknięto w node'a:", clickedNode);
        return;
    }

    const clickedSegment = mapData.segments.find(segment => {
        const route = segment.route;
        const segment_thickness_tolerance = 0.3; // Próg czułości kliknięcia;

        for (let i = 0; i < route.length - 1; i++) {
            const [x1, y1] = route[i];
            const [x2, y2] = route[i + 1];
    
            // Odległość punktu od odcinka
            const dist = pointToSegmentDistance(mapX, mapY, x1, y1, x2, y2);
            if (dist < segment_thickness_tolerance) return true;
        }
    
        return false;
    });
    
    if (clickedSegment) {
        showEditMenu("segment", clickedSegment, applyChanges, fetchMapData, mapData);
        console.log("Kliknięto w segment:", clickedSegment);
        return;
    }
    
    const clickedIcon = mapData.icons.find(icon => {
        const [x, y] = icon.coordinates;
        const halfSize = (icon.size / 2) / 50; // rozmiar ikony w jednostkach mapy
        const radius = halfSize * scale;
    
        const isWithinBounds =
            mapX >= x - halfSize && mapX <= x + halfSize &&
            mapY >= y - halfSize && mapY <= y + halfSize;
    
        if (!isWithinBounds) return false;
    
        const distance = Math.hypot(mapX - x, mapY - y);
        return distance <= radius;
    });
    
    if (clickedIcon) {
        showEditMenu("icon", clickedIcon, applyChanges, fetchMapData, mapData);
        console.log("Kliknięto w ikonę:", clickedIcon);
        return;
    }

    const clickedRiver = mapData.rivers.find(river => {
        const route = river.route;
        const river_thickness_tolerance = 0.3; // Próg czułości kliknięcia;

        for (let i = 0; i < route.length - 1; i++) {
            const [x1, y1] = route[i];
            const [x2, y2] = route[i + 1];
    
            // Odległość punktu od odcinka
            const dist = pointToSegmentDistance(mapX, mapY, x1, y1, x2, y2);
            if (dist < river_thickness_tolerance) return true;
        }
    
        return false;
    });
    
    if (clickedRiver) {
        showEditMenu("river", clickedRiver, applyChanges, fetchMapData, mapData);
        console.log("Kliknięto w rzekę:", clickedRiver);
        return;
    }
});





// Apply Changes
function applyChanges(type, element) {
    console.log("Applying changes locally:", { type, element });

    if (type === "node") {
        const nodeIndex = mapData.nodes.findIndex(node => node.id === element.id);
        if (nodeIndex !== -1) {
            mapData.nodes[nodeIndex] = element; // Aktualizuj istniejący node
        } else {
            mapData.nodes.push(element); // Dodaj nowy node
        }
    } else if (type === "segment") {
        const segmentIndex = mapData.segments.findIndex(segment => segment.id === element.id);
        if (segmentIndex !== -1) {
            mapData.segments[segmentIndex] = element; // Aktualizuj istniejący segment
        } else {
            mapData.segments.push(element); // Dodaj nowy segment
        }
    } else if (type === "icon") {
        const iconIndex = mapData.icons.findIndex(icon => icon.id === element.id);
        if (iconIndex !== -1) {
            mapData.icons[iconIndex] = element; // Aktualizuj istniejącą ikonę
        } else {
            mapData.icons.push(element); // Dodaj nową ikonę
        }
    } else if (type === "line") {
        const lineIndex = mapData.lines.findIndex(line => line.id === element.id);
        if (lineIndex !== -1) {
            mapData.lines[lineIndex] = element; // Aktualizuj istniejącą linię
        } else {
            mapData.lines.push(element); // Dodaj nową linię
        }
    } else if (type === "river") {
        const riverIndex = mapData.rivers.findIndex(river => river.id === element.id);
        if (riverIndex !== -1) {
            mapData.rivers[riverIndex] = element; // Aktualizuj istniejącą rzekę
        } else {
            mapData.rivers.push(element); // Dodaj nową rzekę
        }
    }
    else if (type === "map_settings") {
        Object.assign(mapData, element); // Aktualizuj ustawienia mapy
    } else {
        console.error(`Unsupported type: ${type}`);
        return;
    }

    fetchMapData();
}


document.getElementById("upload-map").addEventListener("click", uploadMap);
document.getElementById("download-map").addEventListener("click", () => downloadMap(mapData));
document.getElementById("add-icon").addEventListener("click", uploadIcon);
export let recentIcon = null;

//resizeCanvas();
loadInitialMapData(fetchMapData); // Załaduj mapę na start

export let isPlacingNode = false;
export let tempNode = null;

export function setPlacingNode(value) {
    isPlacingNode = value;
}

export function setTempNode(node) {
    tempNode = node;
}

document.getElementById("add-station").addEventListener("click", () => {
    isPlacingNode = true;
    tempNode = {
        id: `N${Date.now()}`, // Tymczasowe ID
        label: "New Station",
        label_position: [10, 10],
        label_text_degree: 90,
        coordinates: [0, 0],
        type: "standard_black",
        type_rotation: 90,
        size: 20
    };
    canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
});

canvas.addEventListener("mousemove", (e) => {
    if (!isPlacingNode || !tempNode) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);

    // Przyciąganie do całkowitych punktów
    tempNode.coordinates = [Math.round(mapX), Math.round(mapY)];

    // Odśwież mapę i narysuj tymczasowy węzeł
    fetchMapData();
    ctx.save();
    ctx.translate(
        tempNode.coordinates[0] * 50 * scale + canvas.width / 2 + offsetX,
        -(tempNode.coordinates[1] * 50 * scale - canvas.height / 2 - offsetY)
    );
    ctx.beginPath();
    ctx.arc(0, 0, tempNode.size / 2 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
});

canvas.addEventListener("click", (e) => {
    if (!isPlacingNode || !tempNode) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);

    // Przyciąganie do całkowitych punktów
    tempNode.coordinates = [Math.round(mapX), Math.round(mapY)];

    if (mapData.nodes.some(node => node.id === tempNode.id)) {
        // Aktualizuj istniejący węzeł
        const nodeIndex = mapData.nodes.findIndex(node => node.id === tempNode.id);
        mapData.nodes[nodeIndex] = { ...tempNode };

        // Zaktualizuj segmenty powiązane z tym węzłem
        updateSegmentsForNode(tempNode);
    } else {
        // Dodaj nowy węzeł
        mapData.nodes.push({ ...tempNode });
    }

    // Wyłącz tryb umieszczania
    isPlacingNode = false;
    tempNode = null;
    canvas.style.cursor = "default";

    // Odśwież mapę
    fetchMapData();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPlacingNode) {
        isPlacingNode = false;
        tempNode = null;
        canvas.style.cursor = "default";
        fetchMapData(); // Odśwież mapę, aby usunąć tymczasowy węzeł
    }
});

export let selectedLines = []; // Lista zcheckboxów linii
export function setSelectedLines(lines) {
    selectedLines = lines;
}
export let isDrawingSegment = false;
export let tempSegment = null; // Tymczasowy segment
export function setDrawingSegment(value) {
    isDrawingSegment = value;
}
export function setTempSegment(segment) {
    tempSegment = { ...segment }; // Skopiuj wszystkie właściwości segmentu
}
document.getElementById("add-segment").addEventListener("click", () => {
    console.log("Przypisywanie linii do segmentu")
    isDrawingSegment = true;
    tempSegment = {
        id: `S${Date.now()}`, // Tymczasowe ID
        start_node: null,
        end_node: null,
        route: [], // Punkty pośrednie
        lines: [...selectedLines] // Użyj kopii selectedLines zamiast referencji
    };
    canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
});
canvas.addEventListener("click", (e) => {
    if (!isDrawingSegment || !tempSegment) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    const snappedCoordinates = [Math.round(mapX), Math.round(mapY)];

    // Sprawdź, czy kliknięto w węzeł
    const clickedNode = mapData.nodes.find(node => {
        const [x, y] = node.coordinates;
        return snappedCoordinates[0] === x && snappedCoordinates[1] === y;
    });

    if (!tempSegment.start_node) {
        // Ustaw węzeł początkowy
        if (clickedNode) {
            tempSegment.start_node = clickedNode.id;
            tempSegment.route.push([...clickedNode.coordinates]);
        } else {
            console.warn("Musisz zacząć od węzła!");
            // resetowanie flag
            isDrawingSegment = false;
            tempSegment = null;
            canvas.style.cursor = "default";
        }
    } else if (clickedNode) {
        // Ustaw węzeł końcowy i zakończ segment
        tempSegment.end_node = clickedNode.id;
        tempSegment.route.push([...clickedNode.coordinates]);

        // Znajdź istniejący segment i zaktualizuj go
        const segmentIndex = mapData.segments.findIndex(segment => segment.id === tempSegment.id);
        if (segmentIndex !== -1) {
            mapData.segments[segmentIndex] = { ...tempSegment };
        } else {
            mapData.segments.push({ ...tempSegment });
        }

        isDrawingSegment = false;
        canvas.style.cursor = "default";

        // Otwórz menu edycji segmentu
        showEditMenu("segment", tempSegment, applyChanges, fetchMapData, mapData);

        tempSegment = null;
        fetchMapData(); // Odśwież mapę
    } else {
        // Dodaj punkt pośredni
        tempSegment.route.push(snappedCoordinates);
    }

    fetchMapData(); // Odśwież mapę, aby narysować tymczasowy segment
});
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawingSegment || !tempSegment) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    const snappedCoordinates = [Math.round(mapX), Math.round(mapY)];

    fetchMapData(); // Odśwież mapę
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    // Rysuj trasę segmentu
    const fullRoute = [...tempSegment.route, snappedCoordinates];
    for (let i = 0; i < fullRoute.length - 1; i++) {
        const [x1, y1] = fullRoute[i];
        const [x2, y2] = fullRoute[i + 1];
        ctx.moveTo(x1 * 50 * scale + canvas.width / 2 + offsetX, -(y1 * 50 * scale - canvas.height / 2 - offsetY));
        ctx.lineTo(x2 * 50 * scale + canvas.width / 2 + offsetX, -(y2 * 50 * scale - canvas.height / 2 - offsetY));
    }

    ctx.stroke();
    ctx.restore();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawingSegment) {
        isDrawingSegment = false;
        tempSegment = null;
        canvas.style.cursor = "default";
        fetchMapData(); // Odśwież mapę, aby usunąć tymczasowy segment
    }
});

// Funkcja do aktualizacji segmentów po zmianie węzła
function updateSegmentsForNode(node) {
    mapData.segments.forEach(segment => {
        if (segment.start_node === node.id) {
            // Jeśli węzeł jest start_node, aktualizuj pierwszy punkt trasy
            segment.route[0] = [...node.coordinates];
        }
        else if (segment.end_node === node.id) {
            // Jeśli węzeł jest end_node, aktualizuj ostatni punkt trasy
            segment.route[segment.route.length - 1] = [...node.coordinates];
            
        }
    });
}

export let isDrawingRiver = false;
export let tempRiver = null; // Tymczasowa rzeka

export function setDrawingRiver(value) {
    isDrawingRiver = value;
}

export function setTempRiver(river) {
    tempRiver = { ...river }; // Skopiuj wszystkie właściwości rzeki
}
document.getElementById("add-river").addEventListener("click", () => {
    isDrawingRiver = true;
    tempRiver = {
        id: `R${Date.now()}`, // Tymczasowe ID
        label: "New River",
        route: [], // Punkty trasy
        width: 20, // Domyślna szerokość
        color: "#0000FF" // Domyślny kolor
    };
    canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
});
canvas.addEventListener("click", (e) => {
    if (!isDrawingRiver || !tempRiver) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    const snappedCoordinates = [Math.round(mapX), Math.round(mapY)];

    // Dodaj punkt do trasy rzeki
    tempRiver.route.push(snappedCoordinates);

    fetchMapData(); // Odśwież mapę, aby narysować tymczasową rzekę
});
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawingRiver || !tempRiver) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    const snappedCoordinates = [Math.round(mapX), Math.round(mapY)];

    fetchMapData(); // Odśwież mapę
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;


    // Rysuj trasę rzeki
    const fullRoute = [...tempRiver.route, snappedCoordinates];
    for (let i = 0; i < fullRoute.length - 1; i++) {
        const [x1, y1] = fullRoute[i];
        const [x2, y2] = fullRoute[i + 1];
        ctx.moveTo(x1 * 50 * scale + canvas.width / 2 + offsetX, -(y1 * 50 * scale - canvas.height / 2 - offsetY));
        ctx.lineTo(x2 * 50 * scale + canvas.width / 2 + offsetX, -(y2 * 50 * scale - canvas.height / 2 - offsetY));
    }

    ctx.stroke();
    ctx.restore();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawingRiver) {
        isDrawingRiver = false;
        tempRiver = null;
        canvas.style.cursor = "default";
        fetchMapData(); // Odśwież mapę, aby usunąć tymczasową rzekę
    }
});
canvas.addEventListener("dblclick", () => {
    if (!isDrawingRiver || !tempRiver) return;

    // Dodaj rzekę do mapData
    mapData.rivers.push({ ...tempRiver });

    isDrawingRiver = false;
    tempRiver = null;
    canvas.style.cursor = "default";

    // Otwórz menu edycji rzeki
    showEditMenu("river", mapData.rivers[mapData.rivers.length - 1], applyChanges, fetchMapData, mapData);

    fetchMapData(); // Odśwież mapę
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && isDrawingRiver) {
        // Dodaj rzekę do mapData
        mapData.rivers.push({ ...tempRiver });

        isDrawingRiver = false;
        tempRiver = null;
        canvas.style.cursor = "default";

        // Otwórz menu edycji rzeki
        showEditMenu("river", mapData.rivers[mapData.rivers.length - 1], applyChanges, fetchMapData, mapData);

        fetchMapData(); // Odśwież mapę
    }
});


export let isPlacingIcon = false;
export let tempIcon = null;
export function setPlacingIcon(value) {
    isPlacingIcon = value;
}
export function setTempIcon(icon) {
    tempIcon = { ...icon }; // Skopiuj wszystkie właściwości ikony
}
document.getElementById("add-icon").addEventListener("click", () => {
    isPlacingIcon = true;
    tempIcon = {
        id: `N${Date.now()}`, // Tymczasowe ID
        label: "New Icon",
        coordinates: [0, 0],
        size: 10,
        icon: recentIcon
    };
    canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
});

canvas.addEventListener("mousemove", (e) => {
    if (!isPlacingIcon || !tempIcon) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);

    // Przyciąganie do całkowitych punktów
    tempIcon.coordinates = [Math.round(mapX), Math.round(mapY)];

    // Odśwież mapę i narysuj tymczasowy węzeł
    fetchMapData();
    ctx.save();
    ctx.translate(
        tempIcon.coordinates[0] * 50 * scale + canvas.width / 2 + offsetX,
        -(tempIcon.coordinates[1] * 50 * scale - canvas.height / 2 - offsetY)
    );
    ctx.beginPath();
    ctx.arc(0, 0, tempIcon.size / 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
});

canvas.addEventListener("click", (e) => {
    if (!isPlacingIcon || !tempIcon) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);

    // Przyciąganie do całkowitych punktów
    tempIcon.coordinates = [Math.round(mapX), Math.round(mapY)];

    if (mapData.icons.some(icon => icon.id === tempIcon.id)) {
        // Aktualizuj istniejącą ikonę
        const iconIndex = mapData.icons.findIndex(icon => icon.id === tempIcon.id);
        mapData.icons[iconIndex] = { ...tempIcon };
    } else {
        // Dodaj nową ikonę
        mapData.icons.push({ ...tempIcon });
    }

    // Wyłącz tryb umieszczania
    isPlacingIcon = false;
    tempIcon = null;
    canvas.style.cursor = "default";

    // Odśwież mapę
    fetchMapData();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPlacingIcon) {
        isPlacingIcon = false;
        tempIcon = null;
        canvas.style.cursor = "default";
        fetchMapData(); // Odśwież mapę, aby usunąć tymczasową ikonę
    }
});

let isSelectingExportArea = false;
let exportAreaStart = null;
let exportAreaEnd = null;
let exportAreaRect = null;

document.getElementById("export-png").addEventListener("click", () => {
    isSelectingExportArea = true;
    canvas.style.cursor = "crosshair";
});

// Zmiana: obsługa mousedown podczas exportu
canvas.addEventListener('click', (e) => {
    if (!isSelectingExportArea) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    
    if (!exportAreaStart) {
        exportAreaStart = [mapX, mapY];
    } else {
        exportAreaEnd = [mapX, mapY];
        canvas.style.cursor = 'default';
        exportAreaRect = [
            Math.min(exportAreaStart[0], exportAreaEnd[0]),
            Math.min(exportAreaStart[1], exportAreaEnd[1]),
            Math.max(exportAreaStart[0], exportAreaEnd[0]),
            Math.max(exportAreaStart[1], exportAreaEnd[1])
        ];

        exportToFormat(mapData, 'png', exportAreaRect);

        isSelectingExportArea = false;
        exportAreaStart = null;
        exportAreaEnd = null;
        exportAreaRect = null;
        canvas.style.cursor = 'default';
    }
})

canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSelectingExportArea) {
        isSelectingExportArea = false;
        exportAreaStart = null;
        exportAreaEnd = null;
        exportAreaRect = null;
        canvas.style.cursor = 'default';
    }
})