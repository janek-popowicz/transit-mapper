import { visualizeMap } from './draw.js';
import { pointToSegmentDistance } from './clickHandlers.js';
import { getMapCoordinatesFromClick } from './clickHandlers.js';

let mapData = null; // Globalna zmienna na dane mapy

// Inicjalizacja canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

// Dopasowanie rozmiaru canvas do okna przeglądarki
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Funkcja do pobierania danych mapy z backendu
async function fetchMapData() {
    const response = await fetch('/get_map');
    mapData = await response.json(); // Zapisz dane w globalnej zmiennej
    visualizeMap(mapData, ctx, canvas, offsetX, offsetY, scale); // Przekazanie przesunięcia i skali
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
        debounceFetchMapData(); // Ogranicz liczbę zapytań
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "default";
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

// Obsługa przycisków zoomu
document.querySelector('.menu button:nth-child(5)').addEventListener('click', () => {
    applyZoom(1.1); // Powiększ widok
});

document.querySelector('.menu button:nth-child(6)').addEventListener('click', () => {
    applyZoom(0.9); // Pomniejsz widok
});

// Nasłuchiwanie zdarzenia zmiany rozmiaru okna
window.addEventListener("resize", () => {
    resizeCanvas();
    fetchMapData(); // Odśwież mapę po zmianie rozmiaru okna
});

// Ustaw początkowy rozmiar canvas
resizeCanvas();
fetchMapData(); // Załaduj mapę na start

// Ustaw domyślny kursor na "grab"
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
        // showEditMenu("node", clickedNode, e.clientX, e.clientY);
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
        // showEditMenu("segment", clickedSegment, e.clientX, e.clientY);
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
        // showEditMenu("icon", clickedIcon, e.clientX, e.clientY);
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
        // showEditMenu("segment", clickedSegment, e.clientX, e.clientY);
        console.log("Kliknięto w rzekę:", clickedRiver);
        return;
    }
});

function showEditMenu(type, element, clickX, clickY) {
    const menu = document.createElement("div");
    menu.className = "edit-menu";
    menu.style.position = "absolute";
    menu.style.left = `${clickX}px`;
    menu.style.top = `${clickY}px`;

    menu.style.backgroundColor = "white";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "10px";
    menu.style.zIndex = 1000;

    // Dodaj pola edycji w zależności od typu elementu
    if (type === "node") {
        menu.innerHTML = `
            <h3>Edit Node</h3>
            <label>Label: <input type="text" id="node-label" value="${element.label}"></label><br>
            <label>Size: <input type="number" id="node-size" value="${element.size}"></label><br>
            <button id="save-node">Save</button>
        `;
    } else if (type === "icon") {
        menu.innerHTML = `
            <h3>Edit Icon</h3>
            <label>Label: <input type="text" id="icon-label" value="${element.label}"></label><br>
            <label>Size: <input type="number" id="icon-size" value="${element.size}"></label><br>
            <button id="save-icon">Save</button>
        `;
    }

    document.body.appendChild(menu);

    // Obsługa zapisu zmian
    menu.querySelector("button").addEventListener("click", () => {
        if (type === "node") {
            element.label = menu.querySelector("#node-label").value;
            element.size = parseInt(menu.querySelector("#node-size").value, 10);
        } else if (type === "icon") {
            element.label = menu.querySelector("#icon-label").value;
            element.size = parseInt(menu.querySelector("#icon-size").value, 10);
        }

        // Wyślij zmiany do backendu
        saveChanges(type, element);

        // Usuń menu edycji
        document.body.removeChild(menu);

        // Odśwież mapę
        fetchMapData();
    });
}


async function saveChanges(type, element) {
    const endpoint = type === "node" ? "/edit_node" : "/edit_icon";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(element),
    });

    const result = await response.json();
    if (result.status === "success") {
        console.log(`${type} updated successfully.`);
    } else {
        console.error(`Failed to update ${type}:`, result.message);
    }
}