import { visualizeMap } from './draw.js';
import { pointToSegmentDistance } from './clickHandlers.js';
import { getMapCoordinatesFromClick } from './clickHandlers.js';
import { showEditMenu } from './editMenu.js';
import { generateLineList } from './lineMenu.js';
import { uploadMap, downloadMap, loadInitialMapData } from './importexport.js';

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
    console.log("Fetched map data:", mapData); // Loguj dane mapy
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



canvas.addEventListener("click", (e) => {
    if (!mapData) return;

    const [mapX, mapY] = getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale);
    // console.log(`Kliknięcie w: (${mapX.toFixed(2)}, ${mapY.toFixed(2)})`);
    console.log(mapX, mapY);
   
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

function applyChanges(type, element) {
    console.log("Applying changes locally:", { type, element });

    if (type === "node") {
        const nodeIndex = mapData.nodes.findIndex(node => node.id === element.id);
        if (nodeIndex !== -1) {
            mapData.nodes[nodeIndex] = element; // Aktualizuj istniejący node
        } else {
            mapData.nodes.push(element); // Dodaj nowy node
        }
    } else if (type === "icon") {
        const iconIndex = mapData.icons.findIndex(icon => icon.id === element.id);
        if (iconIndex !== -1) {
            mapData.icons[iconIndex] = element; // Aktualizuj istniejącą ikonę
        } else {
            mapData.icons.push(element); // Dodaj nową ikonę
        }
    } else if (type === "segment") {
        const segmentIndex = mapData.segments.findIndex(segment => segment.id === element.id);
        if (segmentIndex !== -1) {
            mapData.segments[segmentIndex] = element; // Aktualizuj istniejący segment
        } else {
            mapData.segments.push(element); // Dodaj nowy segment
        }
    } else if (type === "line") {
        const lineIndex = mapData.lines.findIndex(line => line.id === element.id);
        if (lineIndex !== -1) {
            mapData.lines[lineIndex] = element; // Aktualizuj istniejącą linię
        } else {
            mapData.lines.push(element); // Dodaj nową linię
        }
    } else if (type === "map_settings") {
        Object.assign(mapData, element); // Aktualizuj ustawienia mapy
    } else {
        console.error(`Unsupported type: ${type}`);
        return;
    }

    fetchMapData();
}


document.getElementById("upload-map").addEventListener("click", uploadMap);
document.getElementById("download-map").addEventListener("click", () => downloadMap(mapData));

//resizeCanvas();
loadInitialMapData(fetchMapData); // Załaduj mapę na start

