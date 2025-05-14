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
    console.log("Pobrane dane mapy:", data); // Logowanie danych
    visualizeMap(data, ctx, canvas);
}

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