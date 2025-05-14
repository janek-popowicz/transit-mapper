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
        fetchMapData(); // Ponowne rysowanie mapy z nowym przesunięciem
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "default"; // Przywróć kursor na "grab"
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "default"; // Przywróć kursor na "grab"
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

// Ustaw domyślny kursor na "grab"
canvas.style.cursor = "default";

// Rozpoczęcie pętli animacji
requestAnimationFrame(updateMap);