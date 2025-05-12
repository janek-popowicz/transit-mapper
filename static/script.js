// Inicjalizacja canvas
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

// Dopasowanie rozmiaru canvas do okna przeglądarki
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Funkcja do pobierania danych mapy z backendu
async function fetchMapData() {
    const response = await fetch('/get_map');
    const data = await response.json();
    console.log("Pobrane dane mapy:", data); // Logowanie danych
    visualizeMap(data);
}

// Funkcja do wizualizacji mapy
function visualizeMap(data) {
    // Wyczyszczenie canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skala mapy (dostosowanie współrzędnych do rozmiaru canvas)
    const scale = 50; // Każda jednostka mapy to 50 pikseli
    const offsetX = canvas.width / 2; // Środek canvas jako punkt odniesienia
    const offsetY = canvas.height / 2;

    // Odwrócenie osi Y
    ctx.save(); // Zapisz aktualny stan kontekstu
    ctx.translate(0, canvas.height); // Przesuń początek układu współrzędnych na dół canvas
    ctx.scale(1, -1); // Odwróć oś Y

    // Rysowanie segmentów
    data.segments.forEach(segment => {
        const startNode = data.nodes.find(node => node.id === segment.start_node);
        const endNode = data.nodes.find(node => node.id === segment.end_node);

        if (startNode && endNode) {
            ctx.beginPath();
            ctx.moveTo(startNode.coordinates[0] * scale + offsetX, startNode.coordinates[1] * scale + offsetY);
            ctx.lineTo(endNode.coordinates[0] * scale + offsetX, endNode.coordinates[1] * scale + offsetY);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Rysowanie węzłów
    data.nodes.forEach(node => {
        const x = node.coordinates[0] * scale + offsetX;
        const y = node.coordinates[1] * scale + offsetY;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2); // Rysowanie okręgu
        ctx.fillStyle = "blue";
        ctx.fill();

        // Dodanie etykiety (odwrócenie osi Y wymaga specjalnego podejścia)
        ctx.save(); // Zapisz aktualny stan kontekstu
        ctx.scale(1, -1); // Przywróć normalną orientację tekstu
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(node.label, x + 8, -(y - 8)); // Odwrócenie współrzędnych Y dla tekstu
        ctx.restore(); // Przywróć poprzedni stan kontekstu
    });

    ctx.restore(); // Przywróć pierwotny układ współrzędnych
}

// Pobranie danych mapy i wizualizacja
fetchMapData();