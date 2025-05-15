function drawSmoothPath(ctx, points, offsetY = 0) {
    if (points.length < 2) return;

    const scale = 50;

    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];

    const firstMid = mid(first, second);
    const lastMid = mid(secondLast, last);

    ctx.beginPath();
    ctx.moveTo(first[0] * scale, first[1] * scale + offsetY);
    ctx.lineTo(firstMid[0] * scale, firstMid[1] * scale + offsetY);

    // Krzywe od środka do środka przez środkowy punkt
    for (let i = 1; i < points.length - 1; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];

        const start = mid(p0, p1);
        const end = mid(p1, p2);
        const ctrl = p1;

        ctx.quadraticCurveTo(
            ctrl[0] * scale,
            ctrl[1] * scale + offsetY,
            end[0] * scale,
            end[1] * scale + offsetY
        );
    }

    // Ostatnia linia od końcowego środka do ostatniego punktu
    ctx.lineTo(last[0] * scale, last[1] * scale + offsetY);

    ctx.stroke();
}



export function visualizeMap(data, ctx, canvas, offsetX = 0, offsetY = 0, scale = 1) {
    // Wyczyszczenie canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skala mapy (dostosowanie współrzędnych do rozmiaru canvas)
    const centerX = canvas.width / 2 + offsetX; // Uwzględnienie przesunięcia
    const centerY = canvas.height / 2 + offsetY;

    // Odwrócenie osi Y
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, -scale); // Uwzględnienie skali i odwrócenie osi Y

    // 1. Rysowanie rzek
    data.rivers.forEach(river => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = river.width; // Skalowanie szerokości rzeki
        ctx.strokeStyle = river.color; // Kolor rzeki
        const [startX, startY] = river.route[0];
        drawSmoothPath(ctx, river.route);
        ctx.stroke();
        ctx.restore();
    });
    
    // 2. Rysowanie ikon
    const iconCache = {}; // Cache na załadowane obrazy ikon

    data.icons.forEach(icon => {
        const centerX = canvas.width / 2 + offsetX;
        const centerY = canvas.height / 2 + offsetY;

        const x = centerX + icon.coordinates[0] * 50 * scale;
        const y = centerY - icon.coordinates[1] * 50 * scale; // oś Y jest odwrócona

        if (!iconCache[icon.icon]) {
            // Jeśli obraz nie jest jeszcze załadowany, załaduj go
            const img = new Image();
            img.src = icon.icon; // Ścieżka do pliku ikony
            img.onload = () => {
                iconCache[icon.icon] = img; // Zapisz obraz w cache
                ctx.save();
                ctx.translate(x, y); // Przesunięcie do pozycji ikony
                ctx.scale(1 * scale, 1 * scale); // Skalowanie ikony
                ctx.drawImage(img, -icon.size / 2, -icon.size / 2, icon.size, icon.size); // Rysowanie ikony od środka
                ctx.restore();
            };
        } else {
            // Jeśli obraz jest już załadowany, rysuj go od razu
            const img = iconCache[icon.icon];
            ctx.save();
            ctx.translate(x, y); // Przesunięcie do pozycji ikony
            ctx.scale(1 * scale, 1 * scale); // Skalowanie ikony
            ctx.drawImage(img, -icon.size / 2, -icon.size / 2, icon.size, icon.size); // Rysowanie ikony od środka
            ctx.restore();
        }
    });

    // 3. Rysowanie segmentów
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
                const thickness = line.thickness; // Pobranie grubości linii z JSON-a

                // Obliczenie przesunięcia dla tej linii
                const offset = currentOffset + thickness / 2;

                ctx.save(); // Zapisz aktualny stan kontekstu
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness; // Skalowanie grubości linii
                ctx.beginPath();
                drawSmoothPath(ctx, route, offset);



                ctx.stroke();
                ctx.restore(); // Przywróć poprzedni stan kontekstu

                // Przesuń offset dla następnej linii
                currentOffset += thickness;
            });
        }
    });

    // 4. Rysowanie węzłów
    data.nodes.forEach(node => {
        const x = node.coordinates[0] * 50;
        const y = node.coordinates[1] * 50;

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
                ctx.lineWidth = 2; // Grubość obwódki zmniejsza się przy powiększeniu
                ctx.stroke();
                break;

            case "standard_white":
                // Biały okrąg z czarną obwódką
                ctx.beginPath();
                ctx.arc(0, 0, node.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2; // Grubość obwódki zmniejsza się przy powiększeniu
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
                const labels = node.label.split("|");
                labels.reverse(); // Odwrócenie etykiet, aby były rysowane od dołu do góry
            
                // Ustal czcionkę na podstawie rozmiaru noda
                const fontSize = Math.max(6, node.size * 0.6); // Skalowana czcionka
                ctx.font = `${fontSize}px 'Courier New', monospace`;
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
            
                // Oblicz wymiary tła na podstawie najdłuższej etykiety
                const maxLabel = labels.reduce((a, b) => a.length > b.length ? a : b, "");
                const textMetrics = ctx.measureText(maxLabel);
                const paddingX = fontSize * 0.2;
                const paddingY = fontSize * 0.2;
                const rectWidth = textMetrics.width + paddingX * 1.9;
                const rectHeight = labels.length * fontSize + paddingY *1.9;
            
                // Rysuj zaokrąglony prostokąt w tle
                const radius = 4;
                const x = -rectWidth / 2;
                const y = -rectHeight / 2;
            
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + rectWidth - radius, y);
                ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
                ctx.lineTo(x + rectWidth, y + rectHeight - radius);
                ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - radius, y + rectHeight);
                ctx.lineTo(x + radius, y + rectHeight);
                ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
            
                // Rysuj tekst
                ctx.fillStyle = "black";
                ctx.save();
                ctx.scale(1, -1); // Odwrócenie Y do poprawnego rysowania
                labels.forEach((line, index) => {
                    const lineY = y + paddingY + fontSize / 2 + index * fontSize;
                    ctx.fillText(line, 0, -lineY);
                });
                ctx.restore();
                break;

            case "invisible":
                // do nothing
                break;

            default:
                console.warn(`Nieznany typ węzła: ${node.type}`);
        }

        ctx.restore(); // Przywróć poprzedni stan kontekstu

        // 5. Dodanie etykiety z uwzględnieniem pozycji i kąta obrotu
        if (node.type !== "text" && node.type !== "invisible") {
            ctx.save();
            ctx.scale(1, -1); // Przywróć normalną orientację tekstu
            const labelX = x + (node.label_position[0] || 0); // Pozycja X etykiety
            const labelY = -(y + (node.label_position[1] || 0)); // Pozycja Y etykiety (odwrócenie osi Y)
            ctx.translate(labelX, labelY); // Przesunięcie do pozycji etykiety
            ctx.rotate(((node.label_text_degree || 0) - 90) * Math.PI / 180); // Obrót tekstu

            ctx.font = `${data.labels_size}px Arial`;
            ctx.fillStyle = data.labels_color || "black"; // Kolor etykiety
            ctx.fillText(node.label, 0, 0); // Rysowanie tekstu
            ctx.restore(); // Przywróć poprzedni stan kontekstu
        }
    });

    ctx.restore(); // Przywróć pierwotny układ współrzędnych
}