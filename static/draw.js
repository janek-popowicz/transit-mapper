
// Funkcja do wizualizacji mapy
export function visualizeMap(data, ctx, canvas) {
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

        ctx.save(); // Zapisz aktualny stan kontekstu
        ctx.translate(x, y); // Przesuń układ współrzędnych do pozycji węzła

        // Uwzględnienie obrotu węzła
        const rotation = (node.type_rotation || 0) * Math.PI / 180; // Konwersja stopni na radiany
        ctx.rotate(rotation);

        // Rysowanie węzła w zależności od typu
        switch (node.type) {
            case "standard_black":
                // Czarny okrąg z białą obwódką
                ctx.beginPath();
                ctx.arc(0, 0, (node.size / 2) - 1, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();
                break;


            case "standard_white":
                // Biały okrąg z czarną obwódką
                ctx.beginPath();
                ctx.arc(0, 0, node.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case "arrow":
                // Strzałka
                ctx.beginPath();
                ctx.moveTo(-node.size, -node.size / 2);
                ctx.lineTo(0, 0);
                ctx.lineTo(-node.size, node.size / 2);
                ctx.closePath();
                ctx.fillStyle = "red";
                ctx.fill();
                break;

            case "onedirectional_black":
                // Czarny trójkąt z białą obwódką
                ctx.beginPath();
                ctx.moveTo(-node.size / 2, -node.size / 2);
                ctx.lineTo(node.size / 2, 0);
                ctx.lineTo(-node.size / 2, node.size / 2);
                ctx.closePath();
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case "onedirectional_white":
                // Biały trójkąt z czarną obwódką
                ctx.beginPath();
                ctx.moveTo(-node.size / 2, -node.size / 2);
                ctx.lineTo(node.size / 2, 0);
                ctx.lineTo(-node.size / 2, node.size / 2);
                ctx.closePath();
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case "text":
                const labels = node.label.split("|"); // Podział linii na części
                
             
                // Dynamiczne ustawienie rozmiaru czcionki
                const fontSize = Math.max(8, Math.floor(node.size/labels.length)); // Minimalny rozmiar czcionki to 8
                ctx.font = `${fontSize}px Courier New, monospace`;

                // Obliczenie szerokości prostokąta na podstawie najdłuższego stringa
                const maxLabelLength = labels.reduce((max, label) => Math.max(max, label.length), 0); // Znajdź najdłuższy string
                const rectWidth = maxLabelLength * (fontSize*0.62); // Szerokość prostokąta

                const rectHeight = Math.max(node.size -4, 1); // Wysokość zależna od liczby linii tekstu
                // Rysowanie prostokąta
                ctx.fillStyle = "white";
                ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
                // ctx.strokeStyle = "black";
                // ctx.lineWidth = 2;
                // ctx.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);

                
                ctx.fillStyle = "black";

                // Rysowanie tekstu
                labels.forEach((line, index) => {
                    const textY = (index - (labels.length - 1) / 2) * fontSize; // Pozycja Y dla każdej linii
                    ctx.save();
                    ctx.scale(1, -1); // Przywróć normalną orientację tekstu
                    ctx.fillText(line, -rectWidth / 2 + 1, -textY+(node.size/4)); // Rysowanie tekstu
                    ctx.restore();
                });
                break;
            case "invisible":
                // do nothing
                break;
            default:
                console.warn(`Nieznany typ węzła: ${node.type}`);
        }

        ctx.restore(); // Przywróć poprzedni stan kontekstu

        // Dodanie etykiety z uwzględnieniem pozycji i kąta obrotu
        if (node.type !== "text" && node.type !== "invisible") {
            ctx.save();
            ctx.scale(1, -1); // Przywróć normalną orientację tekstu
            const labelX = x + (node.label_position[0] || 0); // Pozycja X etykiety
            const labelY = -(y + (node.label_position[1] || 0)); // Pozycja Y etykiety (odwrócenie osi Y)
            ctx.translate(labelX, labelY); // Przesunięcie do pozycji etykiety
            ctx.rotate(((node.label_text_degree || 0) - 90) * Math.PI / 180); // Obrót tekstu

            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(node.label, 0, 0); // Rysowanie tekstu
            ctx.restore(); // Przywróć poprzedni stan kontekstu
        }
    });

    ctx.restore(); // Przywróć pierwotny układ współrzędnych
}