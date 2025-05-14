import { visualizeMap } from './draw.js';

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
    const data = await response.json();
    visualizeMap(data, ctx, canvas, offsetX, offsetY, scale); // Przekazanie przesunięcia i skali
}

// Przesuwanie mapy
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let offsetX = 0; // Przesunięcie mapy w osi X
let offsetY = 0; // Przesunięcie mapy w osi Y
let scale = 1; // Początkowa skala mapy

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        offsetX += dx;
        offsetY += dy;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        fetchMapData(); // Ponowne rysowanie mapy z nowym przesunięciem
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
});

// Obsługa zoomu (scroll myszki)
canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Zapobiegaj domyślnemu przewijaniu strony

    const zoomIntensity = 0.1; // Intensywność zoomu
    const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity; // Powiększanie lub pomniejszanie

    // Aktualizacja skali
    scale *= zoom;

    // Przesunięcie mapy, aby zoom był względem kursora
    const mouseX = e.clientX - canvas.width / 2;
    const mouseY = e.clientY - canvas.height / 2;
    offsetX -= mouseX * (zoom - 1);
    offsetY -= mouseY * (zoom - 1);

    fetchMapData(); // Ponowne rysowanie mapy z nową skalą
});

// Funkcja do kontrolowania liczby klatek na sekundę
let lastFrameTime = 0;
const fpsInterval = 1000 / 30; // 30 klatek na sekundę

function updateMap(currentTime) {
    if (currentTime - lastFrameTime >= fpsInterval) {
        lastFrameTime = currentTime;
        fetchMapData(); // Pobierz dane i narysuj mapę
    }
    requestAnimationFrame(updateMap); // Wywołaj kolejną klatkę
}

// Nasłuchiwanie zdarzenia zmiany rozmiaru okna
window.addEventListener("resize", resizeCanvas);

// Ustaw początkowy rozmiar canvas
resizeCanvas();

// Rozpoczęcie pętli animacji
requestAnimationFrame(updateMap);