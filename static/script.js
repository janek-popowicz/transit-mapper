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
        const route = segment.route;

        if (route && route.length > 1) {
            // Obliczenie całkowitej grubości wszystkich linii w segmencie
            const lineThicknesses = segment.lines.map(lineId => {
                const line = data.lines.find(l => l.line_id === lineId);
                return line ? line.thickness || 2 : 0;
            });

            const totalThickness = lineThicknesses.reduce((sum, thickness) => sum + thickness, 0);

            // Wyznaczenie początkowego przesunięcia (środek segmentu)
            let currentOffset = -totalThickness / 2;

            // Rysowanie każdej linii w segmencie
            segment.lines.forEach((lineId, index) => {
                const line = data.lines.find(l => l.line_id === lineId);
                if (!line) return; // Jeśli linia nie istnieje, pomiń

                const color = line.color || "black"; // Domyślny kolor
                const thickness = line.thickness || 2; // Pobranie grubości linii z JSON-a

                // Obliczenie przesunięcia dla tej linii
                const offset = currentOffset + thickness / 2;

                ctx.beginPath();
                ctx.moveTo(
                    route[0][0] * scale + offsetX,
                    route[0][1] * scale + offsetY + offset
                );

                for (let i = 1; i < route.length; i++) {
                    ctx.lineTo(
                        route[i][0] * scale + offsetX,
                        route[i][1] * scale + offsetY + offset
                    );
                }

                ctx.strokeStyle = color;
                ctx.lineWidth = thickness; // Ustawienie grubości linii
                ctx.stroke();

                // Przesuń offset dla następnej linii
                currentOffset += thickness;
            });
        }
    });

    // Rysowanie węzłów
    data.nodes.forEach(node => {
        const x = node.coordinates[0] * scale + offsetX;
        const y = node.coordinates[1] * scale + offsetY;

        // Rysowanie węzła
        ctx.beginPath();
        ctx.arc(x, y, node.size/2, 0, Math.PI * 2); // Rozmiar węzła
        ctx.fillStyle = "blue";
        ctx.fill();

        // Dodanie etykiety z uwzględnieniem pozycji i kąta obrotu
        ctx.save(); // Zapisz aktualny stan kontekstu
        ctx.scale(1, -1); // Przywróć normalną orientację tekstu
        const labelX = x + (node.label_position[0] || 0); // Pozycja X etykiety
        const labelY = -(y + (node.label_position[1] || 0)); // Pozycja Y etykiety (odwrócenie osi Y)
        ctx.translate(labelX, labelY); // Przesunięcie do pozycji etykiety
        ctx.rotate(((node.label_text_degree || 0) - 90) * Math.PI / 180); // Obrót tekstu

        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(node.label, 0, 0); // Rysowanie tekstu
        ctx.restore(); // Przywróć poprzedni stan kontekstu
    });

    ctx.restore(); // Przywróć pierwotny układ współrzędnych
}

// Pobranie danych mapy i wizualizacja
fetchMapData();